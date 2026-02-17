import { useState, useEffect } from "react";
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
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { socketService } from "../services/socketService";
import Svg, { Path, Circle, G } from "react-native-svg";



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
  const floatAnim = new Animated.Value(0);

  useEffect(() => {
    // Animación de flotado continua
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

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
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 200}
        enabled={true}
      >
        {/* Purple Section with Logo */}
        <View style={styles.purpleSection}>
          <Animated.Text 
            style={[
              styles.headerTitle,
              {
                transform: [
                  { translateY: floatAnim },
                  { rotate: "-16deg" }
                ]
              }
            ]}
          >
            SUPER TRIVIA
          </Animated.Text>
        </View>

        {/* SVG Wave Divider */}
        <Svg height="60" width={Dimensions.get('window').width} style={styles.waveSvg} viewBox={`0 0 ${Dimensions.get('window').width} 100`} preserveAspectRatio="none">
          <Path
            d={`M 0,50 Q ${Dimensions.get('window').width * 0.25},80 ${Dimensions.get('window').width * 0.5},60 T ${Dimensions.get('window').width},100 L ${Dimensions.get('window').width},0 L 0,0 Z`}
            fill="#6D449B"
          />
        </Svg>

        {/* White Section with Form */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.waveContainer}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={styles.inputRow}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
                    <Circle cx="12" cy="8" r="4" stroke="#1F2937" strokeWidth="2" />
                    <Path d="M 4 20 Q 4 14 12 14 Q 20 14 20 20" stroke="#1F2937" strokeWidth="2" fill="none" />
                  </Svg>
                  <TextInput
                    style={styles.input}
                    value={playerName}
                    onChangeText={setPlayerName}
                    placeholder="Tu Nombre"
                    placeholderTextColor="#9CA3AF"
                    maxLength={20}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputRow}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
                    <Path d="M 7 10 L 7 8 Q 7 4 12 4 Q 17 4 17 8 L 17 10 L 19 10 L 19 22 L 5 22 L 5 10 Z" stroke="#1F2937" strokeWidth="2" fill="none" />
                    <Circle cx="12" cy="16" r="1.5" fill="#1F2937" />
                  </Svg>
                  <TextInput
                    style={[styles.input, styles.uppercaseInput]}
                    value={roomId}
                    onChangeText={(text) => setRoomId(text.toUpperCase())}
                    placeholder="ID de Sala"
                    placeholderTextColor="#9CA3AF"
                    maxLength={10}
                    autoCapitalize="characters"
                  />
                </View>
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
                  <Text style={styles.buttonText}>ÚNIRSE A LA FIESTA</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  purpleSection: {
    backgroundColor: "#6D449B",
    paddingVertical: 60,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  waveSvg: {
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFCC00",
    letterSpacing: 2,
    textAlign: "center",
    width: "100%",
    marginTop: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "#FFFFFF",
  },
  waveContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 120,
    minHeight: 350,
    zIndex: 10,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 30,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    paddingBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    color: "#1F2937",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1F2937",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    padding: 0,
    backgroundColor: "transparent",
  },
  uppercaseInput: {
    textTransform: "uppercase",
  },
  button: {
    backgroundColor: "#6D449B",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
    marginTop: 12,
  },
});