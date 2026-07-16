import { createContext } from 'react';

export type Settings = {
  sound: boolean;
  haptics: boolean;
  reducedMotion: boolean;
};

export const SettingsContext = createContext<
  | {
      settings: Settings;
      setSound: (enabled: boolean) => void;
      setHaptics: (enabled: boolean) => void;
      setReducedMotion: (enabled: boolean) => void;
      reset: () => void;
    }
  | null
>(null);
