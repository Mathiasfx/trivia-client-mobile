import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { audioService, SoundType } from "../services/audioService";

interface AudioContextType {
  playSound: (type: SoundType) => Promise<void>;
  playMusic: (type: SoundType) => Promise<void>;
  stopMusic: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  isMusicEnabled: boolean;
  isSoundEnabled: boolean;
  toggleMusic: () => void;
  toggleSound: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
  
  }, []);

  useEffect(() => {
    return () => {
      audioService.stopMusic();
    };
  }, []);

  const playSound = useCallback(async (type: SoundType) => {
    if (isSoundEnabled) {
      await audioService.playSound(type);
    }
  }, [isSoundEnabled]);

  const playMusic = useCallback(async (type: SoundType) => {
    if (isMusicEnabled) {
      await audioService.playMusic(type);
    }
  }, [isMusicEnabled]);

  const stopMusic = useCallback(async () => {
    await audioService.stopMusic();
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    await audioService.setVolume(volume);
  }, []);

  const toggleMusic = useCallback(() => {
    setIsMusicEnabled(!isMusicEnabled);
    if (isMusicEnabled) {
      audioService.stopMusic().catch(err => {
        console.error('Error stopping music:', err);
      });
    }
  }, [isMusicEnabled]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(!isSoundEnabled);
  }, [isSoundEnabled]);

  return (
    <AudioContext.Provider
      value={{
        playSound,
        playMusic,
        stopMusic,
        setVolume,
        isMusicEnabled,
        isSoundEnabled,
        toggleMusic,
        toggleSound,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
};
