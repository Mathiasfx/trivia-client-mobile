import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { socketService } from '../services/socketService';
import type { Room, Player } from '../types/game';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

export const Game = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const route = useRoute<GameScreenRouteProp>();
  const { playerId, room: initialRoom } = route.params;

  const [room, setRoom] = useState<Room>(initialRoom);
  const [question, setQuestion] = useState<{
    round: number;
    question: string;
    options: string[];
    timerSeconds: number;
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [ranking, setRanking] = useState<Player[]>([]);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'playing' | 'gameEnding' | 'finished'>('waiting');
  const [countdownValue, setCountdownValue] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const listenersRegistered = useRef(false);

  // Animaciones
  const timerProgressAnim = useRef(new Animated.Value(1)).current;
  const questionScaleAnim = useRef(new Animated.Value(0)).current;
  const optionsSlideAnim = useRef(new Animated.Value(0)).current;

  const currentPlayer = room?.players.find(p => p.id === playerId);
  const currentScore = currentPlayer?.score || 0;

  useEffect(() => {

    if (listenersRegistered.current) return;
    listenersRegistered.current = true;

    const handleCountdown = () => {
 
      setGameState('countdown');
      setCountdownValue(3);
    };

    const handleGameStarted = (data: any) => {
     
      setTotalQuestions(data.totalQuestions);
    };

    const handleNewRound = (data: any) => {

      setQuestion(data);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setTimeRemaining(data.timerSeconds);
      setIsAnswerCorrect(null);
      setGameState('playing');
      
      // Iniciar animaciones cuando llega una nueva pregunta
      setTimeout(() => {
        resetLayoutAnimation();
        startTimerAnimation(data.timerSeconds * 1000);
      }, 100);
    };

    const handleAnswerSubmitted = (data: any) => {

      setHasAnswered(true);
      setIsAnswerCorrect(data.correct);
    };

    const handleRankingUpdated = (rankingData: Player[]) => {

      setRanking(rankingData);
    };

    const handleGameEnding = (data: any) => {

      setGameState('gameEnding');
      setCountdownValue(data.countdown || 5);
    };

    const handleGameEnded = (data: any) => {
  
      setRanking(data.ranking || []);
      setGameState('finished');
    };

    const handleRoomStateUpdate = (updatedRoom: Room) => {

      setRoom(updatedRoom);
    };

    socketService.on('countdown', handleCountdown);
    socketService.on('gameStarted', handleGameStarted);
    socketService.on('newRound', handleNewRound);
    socketService.on('answerSubmitted', handleAnswerSubmitted);
    socketService.on('rankingUpdated', handleRankingUpdated);
    socketService.on('gameEnding', handleGameEnding);
    socketService.on('gameEnded', handleGameEnded);
    socketService.on('roomStateUpdate', handleRoomStateUpdate);

    return () => {
      socketService.off('countdown', handleCountdown);
      socketService.off('gameStarted', handleGameStarted);
      socketService.off('newRound', handleNewRound);
      socketService.off('answerSubmitted', handleAnswerSubmitted);
      socketService.off('rankingUpdated', handleRankingUpdated);
      socketService.off('gameEnding', handleGameEnding);
      socketService.off('gameEnded', handleGameEnded);
      socketService.off('roomStateUpdate', handleRoomStateUpdate);
    };
  }, []);

  // Timer countdown para preguntas
  useEffect(() => {
    if (!question || timeRemaining <= 0 || gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question, timeRemaining, gameState]);

  // Countdown endgame
  useEffect(() => {
    if ((gameState !== 'countdown' && gameState !== 'gameEnding') || countdownValue <= 0) return;

    const timer = setInterval(() => {
      setCountdownValue(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (gameState === 'countdown') {
            setGameState('playing');
          } else if (gameState === 'gameEnding') {
            setGameState('finished');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, countdownValue]);

  // ============================================
  // FUNCIONES DE ANIMACIÓN (Separadas)
  // ============================================
  
  /**
   * Inicia la animación de barra de progreso consumible
   * @param duration Duración en milisegundos (basada en timerSeconds)
   */
  const startTimerAnimation = (duration: number) => {
    timerProgressAnim.setValue(1);
    Animated.timing(timerProgressAnim, {
      toValue: 0,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Resetea y ejecuta la animación de entrada (scale up con rebote) para pregunta y opciones
   */
  const resetLayoutAnimation = () => {
    questionScaleAnim.setValue(0);
    optionsSlideAnim.setValue(0);

    // Animación de pregunta con spring effect
    Animated.spring(questionScaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Animación de opciones con delay
    Animated.sequence([
      Animated.delay(150),
      Animated.spring(optionsSlideAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ============================================
  // LÓGICA EXISTENTE (Sin modificaciones)
  // ============================================

  const handleSelectAnswer = (option: string) => {
    if (hasAnswered || timeRemaining <= 0) return;

    setSelectedAnswer(option);

    socketService.submitAnswer(room.id, playerId, option);
  };

  if (gameState === 'waiting') {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6D449B" />
          <Text style={styles.loadingText}>Esperando que inicie el juego...</Text>
        </View>
      </View>
    );
  }

  if (gameState === 'countdown') {
    return (
      <View style={styles.container}>
        <View style={styles.dramaticContainer}>
          <Text style={styles.dramaticLabel}>El juego comienza en</Text>
          <Text style={styles.dramaticLargeText}>{countdownValue}</Text>
        </View>
      </View>
    );
  }

  if (gameState === 'gameEnding') {
    return (
      <View style={styles.container}>
        <View style={styles.dramaticContainer}>
          <Text style={styles.dramaticLabel}>Preparando resultados</Text>
          <Text style={styles.dramaticLargeText}>{countdownValue}</Text>
        </View>
      </View>
    );
  }

  if (gameState === 'finished') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>¡Juego Finalizado!</Text>

        </View>

        <ScrollView style={styles.rankingFinalContainer}>
          {ranking.map((player, index) => (
            <View key={player.id} style={[styles.rankingFinalItem, index === 0 && styles.firstPlace]}>
              <View style={styles.medalContainer}>
                <Text style={styles.medal}>
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </Text>
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.finalPlayerName}>{player.name}</Text>
                <Text style={styles.finalPlayerScore}>{player.score} puntos</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            socketService.disconnect();
            navigation.navigate('Login');
          }}
        >
          <Text style={styles.backButtonText}>Volver al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // gameState === 'playing'
  if (!question) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6D449B" />
          <Text style={styles.loadingText}>Cargando pregunta... (Ronda {totalQuestions})</Text>
        </View>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
     
        <Text style={styles.roundBadge}>Ronda {question.round}/{totalQuestions}</Text>
      </View>

      {/* Timer - Visual Progress Bar with Clock Icon */}
      <View style={styles.timerBarWrapper}>
        <Text style={styles.clockIcon}>🕐</Text>
        <View style={styles.timerBarBackground}>
          <Animated.View
            style={[
              styles.timerBarFill,
              {
                width: timerProgressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['100%', '0%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Question - Animated Scale Up */}
        <Animated.View
          style={[
            styles.questionContainer,
            {
              transform: [
                {
                  scale: questionScaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.questionText}>{question.question}</Text>
        </Animated.View>

        {/* Options - Animated Scale Up with Delay */}
        <Animated.View
          style={[
            styles.optionsContainer,
            {
              transform: [
                {
                  scale: optionsSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === room.currentQuestion?.correctAnswer;
            const shouldHighlightCorrect = hasAnswered && isCorrectAnswer;
            const shouldHighlightWrong = hasAnswered && isSelected && !isCorrectAnswer;

            let buttonStyle: any = styles.optionButton;
            let textStyle: any = styles.optionText;

            if (shouldHighlightCorrect) {
              buttonStyle = [styles.optionButton, styles.correctAnswer];
              textStyle = [styles.optionText, styles.correctAnswerText];
            } else if (shouldHighlightWrong) {
              buttonStyle = [styles.optionButton, styles.wrongAnswer];
              textStyle = [styles.optionText, styles.wrongAnswerText];
            } else if (isSelected && !hasAnswered) {
              buttonStyle = [styles.optionButton, styles.selectedOption];
              textStyle = [styles.optionText, styles.selectedOptionText];
            }

            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleSelectAnswer(option)}
                disabled={hasAnswered || timeRemaining <= 0}
              >
                <Text style={textStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Feedback */}
        {hasAnswered && (
          <View style={[styles.feedbackContainer, isAnswerCorrect ? styles.correctFeedback : styles.wrongFeedback]}>
            <Text style={styles.feedbackText}>
              {isAnswerCorrect ? '✓ ¡Correcto!' : '✗ Incorrecto'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFCC00', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B3DB8',
  },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B3DB8',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#6D449B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timerBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  clockIcon: {
    fontSize: 24,
  },
  timerBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#6D449B',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
 
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 4, 
    borderColor: '#6D449B', 
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 20,
  },
 
  optionButton: {
    backgroundColor: '#6D449B', 
    borderWidth: 0,
    borderRadius: 12, 
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  selectedOption: {
    backgroundColor: '#6D449B', 
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
 
  correctAnswer: {
    backgroundColor: '#4CAF50', 
    borderWidth: 0,
  },
  correctAnswerText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  wrongAnswer: {
    backgroundColor: '#F44336', 
    borderWidth: 0,
  },
  wrongAnswerText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  feedbackContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    display: 'none', 
  },
  correctFeedback: {
    backgroundColor: 'transparent',
  },
  wrongFeedback: {
    backgroundColor: 'transparent',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    display: 'none',
  },

  dramaticContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFCC00',
  },
  dramaticLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6D449B',
    marginBottom: 20,
  },
  dramaticLargeText: {
    fontSize: 120,
    fontWeight: '900',
    color: '#6D449B',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop:10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E9D5FF',
  },
  rankingFinalContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFCC00',
  },
  rankingFinalItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firstPlace: {
    backgroundColor: '#6D449B',
    borderWidth: 2,
    borderColor: '#6D449B',
  },
  medalContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  medal: {
    fontSize: 24,
  },
  playerDetails: {
    flex: 1,
  },
  finalPlayerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  finalPlayerScore: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  backButton: {
    backgroundColor: '#6D449B',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rankingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  rankingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rankingPosition: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6D449B',
    width: 30,
  },
  rankingName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  rankingScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
});