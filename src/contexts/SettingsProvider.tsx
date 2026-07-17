import { useCallback, useEffect, useState } from 'react';
import { feedback } from '../lib/feedback';
import { type Settings, SettingsContext } from './SettingsContext';

const defaultSettings: Settings = {
  sound: true,
  haptics: true,
  reducedMotion: false,
};

const STORAGE_KEY = 'battleship-settings';

function loadSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return { ...defaultSettings, ...parsed };
    }
  } catch {
    // ignore corrupt storage
  }
  return defaultSettings;
}

function saveSettings(settings: Settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const loaded = loadSettings();
    feedback.init(loaded);
    return loaded;
  });

  useEffect(() => {
    saveSettings(settings);
    feedback.setSoundEnabled(settings.sound);
    feedback.setHapticsEnabled(settings.haptics);
    if (settings.reducedMotion) {
      document.documentElement.dataset.reducedMotion = 'true';
    } else {
      delete document.documentElement.dataset.reducedMotion;
    }
  }, [settings]);

  const setSound = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, sound: enabled }));
  }, []);

  const setHaptics = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, haptics: enabled }));
  }, []);

  const setReducedMotion = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, reducedMotion: enabled }));
  }, []);

  const reset = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSound, setHaptics, setReducedMotion, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}
