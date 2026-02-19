import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView, 
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { useTheme } from "../hooks/useTheme";
import { socketService } from "../services/socketService";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import Svg, { Path, Circle } from "react-native-svg";
import type { ThemeConfig } from "../contexts/ThemeContext";



type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

const AnimatedImage = Animated.createAnimatedComponent(Image);

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const styles = createStyles(theme);

  useEffect(() => {
  
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 15,
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
  }, []);

  const handleJoinGame = async () => {
    if (!playerName.trim() || !roomId.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }
    setIsLoading(true);
    try {
      await socketService.connect();
 
      
      const handleRoomStateUpdate = (room: any) => {
   
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
 
        setIsLoading(false);
        socketService.off("roomStateUpdate", handleRoomStateUpdate);
        socketService.off("error", handleError);
        clearTimeout(timeoutId);
        Alert.alert(
          "Error de conexión",
          error.message || "No se pudo conectar a la sala. Intenta nuevamente.",
        );
      };

  
      socketService.on("roomStateUpdate", handleRoomStateUpdate);
      socketService.on("error", handleError);

 
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
        enabled={false}
      >
     
        <View style={styles.purpleSection}>
          <AnimatedImage 
            source={theme.logoSource}
            style={[
              styles.logoImage,
              {
                transform: [
                  { translateY: floatAnim },
                  { rotate: "-16deg" }
                ]
              }
            ]}
          />
        </View>


        <Svg height="60" width={Dimensions.get('window').width} style={styles.waveSvg} viewBox={`0 0 ${Dimensions.get('window').width} 100`} preserveAspectRatio="none">
          <Path
            d={`M 0,50 Q ${Dimensions.get('window').width * 0.25},80 ${Dimensions.get('window').width * 0.5},60 T ${Dimensions.get('window').width},100 L ${Dimensions.get('window').width},0 L 0,0 Z`}
            fill="#6D449B"
          />
        </Svg>

  
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.waveContainer}>
            <View style={styles.form}>
              <InputField
                icon={
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
                    <Circle cx="12" cy="8" r="4" stroke="#1F2937" strokeWidth="2" />
                    <Path d="M 4 20 Q 4 14 12 14 Q 20 14 20 20" stroke="#1F2937" strokeWidth="2" fill="none" />
                  </Svg>
                }
                value={playerName}
                onChangeText={setPlayerName}
                placeholder="Tu Nombre"
                maxLength={20}
                autoCapitalize="words"
              />
              <InputField
                icon={
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
                    <Path d="M 7 10 L 7 8 Q 7 4 12 4 Q 17 4 17 8 L 17 10 L 19 10 L 19 22 L 5 22 L 5 10 Z" stroke="#1F2937" strokeWidth="2" fill="none" />
                    <Circle cx="12" cy="16" r="1.5" fill="#1F2937" />
                  </Svg>
                }
                value={roomId}
                onChangeText={(text) => setRoomId(text.toUpperCase())}
                placeholder="ID de Sala"
                maxLength={10}
                autoCapitalize="characters"
              />

              <Button
                onPress={handleJoinGame}
                isLoading={isLoading}
                disabled={!playerName.trim() || !roomId.trim()}
                text="ÚNIRSE A LA FIESTA"
              />
            </View>
            <View>
              <Text style={styles.versionText}>Versión 1.3.1</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const createStyles = (theme: ThemeConfig) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  purpleSection: {
    backgroundColor: theme.primaryColor,
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
    color: theme.secondaryColor,
    letterSpacing: 2,
    textAlign: "center",
    width: "100%",
    marginTop: 20,
  },
  logoImage: {
    width: 280,
    height: 120,
    resizeMode: 'contain',
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
    paddingTop: 40,
    paddingBottom: 120,
    minHeight: 350,
    zIndex: 10,
  },
  form: {
    marginBottom: 20,
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
    marginTop: 12,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#1d1d1d",
    marginTop: 52,
  }
});