// components/Game.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import { socketService } from "../../services/socketService";
import { styles } from "./Game.styles";
import type { Room, Player } from "../../types/game";

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, "Game">;
type GameScreenRouteProp = RouteProp<RootStackParamList, "Game">;

export const Game = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const route = useRoute<GameScreenRouteProp>();
  const {
    playerName,
    //roomId,
    playerId,
    room: initialRoom,
    finalRanking,
    gameEnded,
  } = route.params;

  const [room, setRoom] = useState<Room>(initialRoom);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResults, setShowResults] = useState(false);
  const [playersRanking, setPlayersRanking] = useState<Player[]>([]);

  useEffect(() => {
    const handleNewRound = (data: any) => {
      setCurrentQuestion(data.round - 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setTimeLeft(30);
      setShowResults(false);
    };

    const handleGameEnded = (data: any) => {
      setPlayersRanking(data.ranking || []);
      setShowResults(true);
    };

    const handleCountdown = (data: any) => {
      if (data.time !== undefined) {
        setTimeLeft(data.time);
      } else {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }
    };

    const handleAnswerSubmitted = (data: any) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((player) =>
            player.id === data.playerId
              ? {
                  ...player,
                  answeredAt: new Date(),
                  answeredCorrect: data.correct,
                }
              : player,
          ),
        };
      });
    };

    const handleRankingUpdated = (ranking: Player[]) => {
      setPlayersRanking(ranking);
    };

    socketService.on("newRound", handleNewRound);
    socketService.on("gameEnded", handleGameEnded);
    socketService.on("countdown", handleCountdown);
    socketService.on("answerSubmitted", handleAnswerSubmitted);
    socketService.on("rankingUpdated", handleRankingUpdated);

    return () => {
      socketService.off("newRound", handleNewRound);
      socketService.off("gameEnded", handleGameEnded);
      socketService.off("countdown", handleCountdown);
      socketService.off("answerSubmitted", handleAnswerSubmitted);
      socketService.off("rankingUpdated", handleRankingUpdated);
    };
  }, []);

  const handleAnswerSelect = (answer: string) => {
    if (hasAnswered) return;

    setSelectedAnswer(answer);
    setHasAnswered(true);

    try {
      socketService.submitAnswer(room.id, playerId, answer);
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la respuesta");
    }
  };

  const handleLeaveGame = () => {
    Alert.alert("Salir del Juego", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        onPress: () => {
          socketService.disconnect();
          navigation.navigate("Login");
        },
      },
    ]);
  };

  const handleBackToLobby = () => {
    navigation.navigate("Lobby", {
      playerName,
      roomId: room.id,
      playerId,
      room,
    });
  };

  if (showResults || gameEnded) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleLeaveGame}
            style={styles.leaveButton}
          >
            <Text style={styles.leaveButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Resultados Finales</Text>

          <ScrollView style={styles.rankingContainer}>
            {playersRanking.map((player, index) => (
              <View key={player.id} style={styles.rankingItem}>
                <View style={styles.rankingPosition}>
                  <Text style={styles.positionText}>
                    {index === 0
                      ? "1°"
                      : index === 1
                        ? "2°"
                        : index === 2
                          ? "3°"
                          : `#${index + 1}`}
                  </Text>
                </View>
                <View style={styles.rankingInfo}>
                  <Text style={styles.rankingName}>{player.name}</Text>
                  <Text style={styles.rankingScore}>{player.score} pts</Text>
                </View>
                {player.id === playerId && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youText}>Tú</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.resultsButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToLobby}
            >
              <Text style={styles.secondaryButtonText}>Volver al Lobby</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.primaryButtonText}>Nueva Partida</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (!room || !room.questions || room.questions.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Cargando juego...</Text>
      </View>
    );
  }

  const question = room.questions[currentQuestion];
  const currentPlayer = room.players.find((p) => p.id === playerId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={handleLeaveGame}
            style={styles.leaveButton}
          >
            <Text style={styles.leaveButtonText}>Salir</Text>
          </TouchableOpacity>
          <Text style={styles.roundText}>
            Ronda {currentQuestion + 1}/{room.questions.length}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <Text
            style={[styles.timerText, timeLeft <= 10 && styles.timerTextUrgent]}
          >
            {timeLeft}s
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Puntuación: {currentPlayer?.score || 0}
          </Text>
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      <View style={styles.answersContainer}>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = question.correctAnswer === option;
          const showCorrect = hasAnswered && isCorrect;
          const showWrong = hasAnswered && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.answerButton,
                isSelected && styles.selectedAnswer,
                showCorrect && styles.correctAnswer,
                showWrong && styles.wrongAnswer,
                hasAnswered && styles.disabledAnswer,
              ]}
              onPress={() => handleAnswerSelect(option)}
              disabled={hasAnswered}
            >
              <Text
                style={[
                  styles.answerText,
                  isSelected && styles.selectedAnswerText,
                  showCorrect && styles.correctAnswerText,
                  showWrong && styles.wrongAnswerText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {hasAnswered && (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>
            {selectedAnswer === question.correctAnswer
              ? " Respuesta correcta!"
              : " Respuesta incorrecta"}
          </Text>
          <Text style={styles.waitingSubtext}>
            Esperando a los demás jugadores...
          </Text>
          <ActivityIndicator size="small" color="#7C3AED" />
        </View>
      )}

      <View style={styles.playersStatus}>
        <Text style={styles.playersStatusTitle}>
          Jugadores que han respondido:{" "}
          {room.players.filter((p) => p.answeredAt).length}/
          {room.players.length}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {room.players.map((player) => (
            <View key={player.id} style={styles.playerStatusItem}>
              <Text style={styles.playerStatusName}>{player.name}</Text>
              <View
                style={[
                  styles.playerStatusDot,
                  player.answeredAt ? styles.answeredDot : styles.pendingDot,
                ]}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};
