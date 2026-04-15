import type { SoundType } from '../services/audioService';

export interface AudioContextValue {
  playSound: (type: SoundType) => Promise<void>;
  playMusic: (type: SoundType) => Promise<void>;
  stopMusic: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  isMusicEnabled: boolean;
  isSoundEnabled: boolean;
  toggleMusic: () => void;
  toggleSound: () => void;
}
