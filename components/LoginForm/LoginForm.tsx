import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView, 
  Animated
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";
import { socketService } from "../../services/socketService";
import { styles } from "./LoginForm.styles";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

export const LoginForm = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const handleJoinGame = async () => {
    if (!playerName.trim() || !roomId.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }
    setIsLoading(true);
    try {
      socketService.connect();
      socketService.joinRoom(roomId.trim().toUpperCase(), playerName.trim());
      const handleRoomStateUpdate = (room: any) => {
        const player = room.players.find(
          (p: any) => p.name === playerName.trim(),
        );
        if (player) {
          setIsLoading(false);
          navigation.navigate("Lobby", {
            playerName: playerName.trim(),
            roomId: roomId.trim().toUpperCase(),
            playerId: player.id,
            room,
          });
        }
      };

      const handleError = (error: any) => {
        setIsLoading(false);
        Alert.alert(
          "Error de conexión",
          error.message || "No se pudo conectar a la sala. Intenta nuevamente.",
        );
      };

      socketService.on("roomStateUpdate", handleRoomStateUpdate);
      socketService.on("error", handleError);

      setTimeout(() => {
        setIsLoading(false);
        socketService.off("roomStateUpdate", handleRoomStateUpdate);
        socketService.off("error", handleError);
        Alert.alert("Error", "Tiempo de espera agotado. Intenta nuevamente.");
      }, 5000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "No se pudo conectar al servidor");
    }
  };

  const handleDismissKeyboard = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  
    setTimeout(() => {
      Keyboard.dismiss();
    }, 150);
  };

  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? -50 : 5}
        enabled={Platform.OS === "ios"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={Platform.OS === "android"}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Trivia Game</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tu Nombre</Text>
                <TextInput
                  style={styles.input}
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholder="Ingresa tu nombre"
                  placeholderTextColor="#9CA3AF"
                  maxLength={20}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ID de la Sala</Text>
                <TextInput
                  style={[styles.input, styles.uppercaseInput]}
                  value={roomId}
                  onChangeText={(text) => setRoomId(text.toUpperCase())}
                  placeholder="Ingresa el ID de la sala"
                  placeholderTextColor="#9CA3AF"
                  maxLength={10}
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  (isLoading || !playerName.trim() || !roomId.trim()) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleJoinGame}
                disabled={isLoading || !playerName.trim() || !roomId.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Unirse al Juego</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>
              Ingresa tu nombre y el ID de la sala para comenzar
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};