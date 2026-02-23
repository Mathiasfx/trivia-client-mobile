// components/Lobby.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import { useAudio } from '../contexts/AudioContext';
import { SoundType } from '../services/audioService';
import { socketService } from '../services/socketService';
import type { Room, Player } from '../types/game';
import type { ThemeConfig } from '../contexts/ThemeContext';

type LobbyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Lobby'>;
type LobbyScreenRouteProp = RouteProp<RootStackParamList, 'Lobby'>;

export const LobbyScreen = () => {
  const navigation = useNavigation<LobbyScreenNavigationProp>();
  const route = useRoute<LobbyScreenRouteProp>();
  const { theme } = useTheme();
  const { playMusic } = useAudio();
  const { playerName, roomId, playerId, room: initialRoom } = route.params;
  const styles = createStyles(theme);

const [room, setRoom] = useState<Room>(initialRoom);
const [countdownValue, setCountdownValue] = useState<number | null>(null);

  useEffect(() => {
    playMusic(SoundType.MUSIC_LOGIN_LOBBY);
  }, [playMusic]);

  useEffect(() => {
    const handleCountdown = () => {
      setCountdownValue(3);
    };

    const handleRoomStateUpdate = (updatedRoom: Room) => {
      setRoom(updatedRoom);
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
      console.error('Error en sala:', error.message);
    };

    socketService.on('countdown', handleCountdown);
    socketService.on('roomStateUpdate', handleRoomStateUpdate);
    socketService.on('playerJoined', handlePlayerJoined);
    socketService.on('playerLeft', handlePlayerLeft);
    socketService.on('gameStarted', handleGameStarted);
    socketService.on('error', handleError);

    return () => {
      socketService.off('countdown', handleCountdown);
      socketService.off('roomStateUpdate', handleRoomStateUpdate);
      socketService.off('playerJoined', handlePlayerJoined);
      socketService.off('playerLeft', handlePlayerLeft);
      socketService.off('gameStarted', handleGameStarted);
      socketService.off('error', handleError);
    };
  }, [navigation, playerName, playerId, room, playMusic]);

  // Countdown timer
  useEffect(() => {
    if (countdownValue === null || countdownValue <= 0) return;

    const timer = setInterval(() => {
      setCountdownValue(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownValue]);

  // Si está en countdown, mostrar pantalla dramática
  if (countdownValue !== null && countdownValue > 0) {
    return (
      <View style={styles.countdownContainer}>
        <Text style={styles.countdownLabel}>El juego comienza en</Text>
        <Text style={styles.countdownValue}>{countdownValue}</Text>
      </View>
    );
  }

  const currentPlayer = room?.players.find(p => p.id === playerId);
  const isAdmin = currentPlayer?.isAdmin || false;

  if (!room) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lobby</Text>
        <View style={styles.roomInfo}>
          <Text style={styles.roomId}>Sala: {roomId}</Text>
          <Text style={styles.playerCount}>
            Jugadores: {room.players.filter(p => !p.isAdmin).length}/10
          </Text>
        </View>
      </View>

      <ScrollView style={styles.playersContainer}>
        <Text style={styles.sectionTitle}>Jugadores Conectados</Text>
        {room.players.filter(p => !p.isAdmin).map((player) => (
          <View key={player.id} style={styles.playerCard}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {player.name}
              </Text>
              <Text style={styles.playerStatus}>
                {player.id === playerId ? 'Tú' : 'Conectado'}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: theme.accentColor }]} />
          </View>
        ))}

        {room.players.filter(p => !p.isAdmin).length === 0 && (
          <Text style={styles.emptyText}>
            Esperando jugadores...
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.waitingMessage}>
          <Text style={styles.waitingText}>
            Esperando que el administrador inicie el juego desde el dashboard...
          </Text>
          <ActivityIndicator size="small" color={theme.primaryColor} />
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: theme.primaryColor,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textLight,
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
    color: theme.textLight,
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
    color: theme.textDark,
    marginBottom: 16,
  },
  playerCard: {
    backgroundColor: theme.textLight,
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
    color: theme.textDark,
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
    backgroundColor: theme.textLight,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
  countdownContainer: {
    flex: 1,
    backgroundColor: theme.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.textLight,
    marginBottom: 20,
  },
  countdownValue: {
    fontSize: 120,
    fontWeight: '900',
    color: theme.textLight,
  },
});