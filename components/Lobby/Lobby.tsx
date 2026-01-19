// components/Lobby.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { socketService } from '../../services/socketService';
import type { Room, Player } from '../../types/game';

type LobbyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Lobby'>;
type LobbyScreenRouteProp = RouteProp<RootStackParamList, 'Lobby'>;

export const Lobby = () => {
  const navigation = useNavigation<LobbyScreenNavigationProp>();
  const route = useRoute<LobbyScreenRouteProp>();
  const { playerName, roomId, playerId, room: initialRoom } = route.params;

const [room, setRoom] = useState<Room>(initialRoom);
const [isStartingGame, setIsStartingGame] = useState(false);

  useEffect(() => {

    const handleRoomStateUpdate = (updatedRoom: Room) => {
      setRoom(updatedRoom);
      
   
      if (updatedRoom.isActive) {
        navigation.navigate('Game', {
          playerName,
          playerId,
          room: updatedRoom,
        });
      }
    };

    const handlePlayerJoined = (player: Player) => {
  setRoom(prev => ({ ...prev, players: [...prev.players, player] }));
};


  const handlePlayerLeft = (player: Player) => {
  setRoom(prev => ({
    ...prev,
    players: prev.players.filter(p => p.id !== player.id)
  }));
};

    const handleGameStarted = (data: any) => {
      navigation.navigate('Game', {
        playerName,
        playerId,
        room: room!,
      });
    };

    const handleError = (error: any) => {
      Alert.alert('Error', error.message || 'Ocurrió un error en la sala');
      setIsStartingGame(false);
    };

    socketService.on('roomStateUpdate', handleRoomStateUpdate);
    socketService.on('playerJoined', handlePlayerJoined);
    socketService.on('playerLeft', handlePlayerLeft);
    socketService.on('gameStarted', handleGameStarted);
    socketService.on('error', handleError);

    return () => {
      socketService.off('roomStateUpdate', handleRoomStateUpdate);
      socketService.off('playerJoined', handlePlayerJoined);
      socketService.off('playerLeft', handlePlayerLeft);
      socketService.off('gameStarted', handleGameStarted);
      socketService.off('error', handleError);
    };
  }, [navigation, playerName, playerId, room]);

  const handleStartGame = () => {
    if (!room) return;


    const currentPlayer = room.players.find(p => p.id === playerId);
    if (!currentPlayer?.isAdmin) {
      Alert.alert('Error', 'Solo el administrador puede iniciar el juego');
      return;
    }

    if (room.players.length < 2) {
      Alert.alert('Error', 'Se necesitan al menos 2 jugadores para comenzar');
      return;
    }

    setIsStartingGame(true);
    
    try {
      const triviaId = room.triviaId || 'default-trivia';
      socketService.startGame(roomId, triviaId);
    } catch (error) {
      setIsStartingGame(false);
      Alert.alert('Error', 'No se pudo iniciar el juego');
    }
  };

  const currentPlayer = room?.players.find(p => p.id === playerId);
  const isAdmin = currentPlayer?.isAdmin || false;

  if (!room) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sala de Espera</Text>
        <View style={styles.roomInfo}>
          <Text style={styles.roomId}>Sala: {roomId}</Text>
          <Text style={styles.playerCount}>
            Jugadores: {room.players.length}/10
          </Text>
        </View>
      </View>

      <ScrollView style={styles.playersContainer}>
        <Text style={styles.sectionTitle}>Jugadores Conectados</Text>
        {room.players.map((player) => (
          <View key={player.id} style={styles.playerCard}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {player.name} {player.isAdmin }
              </Text>
              <Text style={styles.playerStatus}>
                {player.id === playerId ? 'Tú' : 'Conectado'}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
          </View>
        ))}

        {room.players.length === 0 && (
          <Text style={styles.emptyText}>
            Esperando jugadores...
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isAdmin && (
          <TouchableOpacity
            style={[
              styles.startButton,
              (room.players.length < 2 || isStartingGame) && styles.buttonDisabled
            ]}
            onPress={handleStartGame}
            disabled={room.players.length < 2 || isStartingGame}
          >
            {isStartingGame ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.startButtonText}>
                {room.players.length < 2 
                  ? `Esperando jugadores (${room.players.length}/2)` 
                  : 'Iniciar Juego'
                }
              </Text>
            )}
          </TouchableOpacity>
        )}

        {!isAdmin && (
          <View style={styles.waitingMessage}>
            <Text style={styles.waitingText}>
              Esperando que el administrador inicie el juego...
            </Text>
            <ActivityIndicator size="small" color="#7C3AED" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#7C3AED',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  roomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomId: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playerCount: {
    fontSize: 14,
    color: '#E9D5FF',
  },
  playersContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  playerStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 40,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  waitingMessage: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  waitingText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
});