import { createContext } from 'react';

export type PwaContextValue = {
  canInstall: boolean;
  isInstalled: boolean;
  prompt: (() => Promise<boolean>) | null;
  isIos: boolean;
};

export const PwaContext = createContext<PwaContextValue>({
  canInstall: false,
  isInstalled: false,
  prompt: null,
  isIos: false,
});
