import { Audio } from "expo-av";

export enum SoundType {
  MUSIC_LOGIN_LOBBY = "music-login-lobby",
  MUSIC_GAME = "music-game",
  BUTTON_CLICK = "button-click",
  CORRECT_ANSWER = "correct-answer",
  INCORRECT_ANSWER = "incorrect-answer",
}

const SOUNDS: Record<SoundType, any> = {
  [SoundType.MUSIC_LOGIN_LOBBY]: require("../assets/sounds/music-login-lobby.mp3"),
  [SoundType.MUSIC_GAME]: require("../assets/sounds/music-game.mp3"),
  [SoundType.BUTTON_CLICK]: require("../assets/sounds/button-click.mp3"),
  [SoundType.CORRECT_ANSWER]: require("../assets/sounds/correct-answer.mp3"),
  [SoundType.INCORRECT_ANSWER]: require("../assets/sounds/incorrect-answer.mp3"),
};

class AudioService {
  private soundObjects: Map<SoundType, Audio.Sound> = new Map();
  private currentMusic: SoundType | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }

  async loadSound(type: SoundType): Promise<Audio.Sound> {
    if (this.soundObjects.has(type)) {
      return this.soundObjects.get(type)!;
    }

    try {
      await this.initialize();
      const { sound } = await Audio.Sound.createAsync(SOUNDS[type]);
      this.soundObjects.set(type, sound);
      return sound;
    } catch (error) {
      console.error(`Error loading sound ${type}:`, error);
      throw error;
    }
  }

  async playSound(type: SoundType): Promise<void> {
    try {
      const sound = await this.loadSound(type);
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.setPositionAsync(0);
        }
      } catch (e) {
       
      }
      await sound.playAsync();
    } catch (error) {
      console.error(`Error playing sound ${type}:`, error);
    }
  }

  async playMusic(type: SoundType, loop: boolean = true): Promise<void> {
    try {
      
      const musicTypes = [SoundType.MUSIC_LOGIN_LOBBY, SoundType.MUSIC_GAME];
      for (const musicType of musicTypes) {
        if (musicType !== type) {
          const sound = this.soundObjects.get(musicType);
          if (sound) {
            try {
              const status = await sound.getStatusAsync();
              if (status.isLoaded && status.isPlaying) {
                await sound.stopAsync();
              }
            } catch (e) {
              
            }
          }
        }
      }

      const sound = await this.loadSound(type);
      await sound.setVolumeAsync(0.5);
      await sound.setIsLoopingAsync(loop);

      
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.setPositionAsync(0);
        }
      } catch (e) {
       
      }

      await sound.playAsync();
      this.currentMusic = type;
    } catch (error) {
      console.error(`Error playing music ${type}:`, error);
    }
  }

  async stopMusic(): Promise<void> {
    try {
   
      const musicTypes = [SoundType.MUSIC_LOGIN_LOBBY, SoundType.MUSIC_GAME];
      for (const musicType of musicTypes) {
        const sound = this.soundObjects.get(musicType);
        if (sound) {
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
              await sound.stopAsync();
            }
          } catch (e) {
            console.error(`Error stopping ${musicType}:`, e);
          }
        }
      }
      this.currentMusic = null;
    } catch (error) {
      console.error("Error stopping all music:", error);
    }
  }

  async stopAllSounds(): Promise<void> {
    try {
      for (const sound of this.soundObjects.values()) {
        await sound.stopAsync();
      }
      this.currentMusic = null;
    } catch (error) {
      console.error("Error stopping all sounds:", error);
    }
  }

  async unloadAllSounds(): Promise<void> {
    try {
      for (const sound of this.soundObjects.values()) {
        await sound.unloadAsync();
      }
      this.soundObjects.clear();
      this.currentMusic = null;
    } catch (error) {
      console.error("Error unloading sounds:", error);
    }
  }

  async setVolume(volume: number): Promise<void> {
    try {
      for (const sound of this.soundObjects.values()) {
        await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (error) {
      console.error("Error setting volume:", error);
    }
  }
}

export const audioService = new AudioService();
