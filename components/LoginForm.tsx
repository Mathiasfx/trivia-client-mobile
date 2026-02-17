import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
import { RootStackParamList } from "../types/navigation";
import { socketService } from "../services/socketService";



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
      await socketService.connect();
      console.log('Socket conectado, preparando join...');
      
      const handleRoomStateUpdate = (room: any) => {
        console.log('roomStateUpdate recibido:', room);
        const player = room.players.find(
          (p: any) => p.name === playerName.trim(),
        );
        if (player) {
          setIsLoading(false);
          socketService.off("roomStateUpdate", handleRoomStateUpdate);
          socketService.off("error", handleError);
          clearTimeout(timeoutId);
          navigation.navigate("Lobby", {
            playerName: playerName.trim(),
            roomId: roomId.trim().toUpperCase(),
            playerId: player.id,
            room,
          });
        }
      };

      const handleError = (error: any) => {
        console.log('Error event recibido:', error);
        setIsLoading(false);
        socketService.off("roomStateUpdate", handleRoomStateUpdate);
        socketService.off("error", handleError);
        clearTimeout(timeoutId);
        Alert.alert(
          "Error de conexión",
          error.message || "No se pudo conectar a la sala. Intenta nuevamente.",
        );
      };

      // Registrar listeners ANTES de hacer join
      socketService.on("roomStateUpdate", handleRoomStateUpdate);
      socketService.on("error", handleError);

      console.log('Emitiendo joinRoom...');
      socketService.joinRoom(roomId.trim().toUpperCase(), playerName.trim());
      
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        socketService.off("roomStateUpdate", handleRoomStateUpdate);
        socketService.off("error", handleError);
        Alert.alert("Error", "Tiempo de espera agotado. Intenta nuevamente.");
      }, 20000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "No se pudo conectar al servidor");
      console.error('Error en handleJoinGame:', error);
    }
  };

  //Animated Keyboard Dismiss
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7C3AED",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#1F2937",
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
  },
  uppercaseInput: {
    textTransform: "uppercase",
  },
  button: {
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
    marginTop: 12,
  },
});