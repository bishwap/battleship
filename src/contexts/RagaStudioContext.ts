import { createContext } from 'react';
import { type Composition } from '../lib/sequencer';
import { type Raga, type Tonic } from '../lib/ragas';
import { type Taal } from '../lib/audio/tabla';

export type RagaStudioContextValue = {
  composition: Composition;
  raga: Raga;
  tonic: Tonic;
  taal: Taal;
  isPlaying: boolean;
  currentBeat: number;
  hasSaved: boolean;
  toggleCell: (row: number, beat: number) => void;
  previewRow: (row: number) => void;
  clear: () => void;
  play: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  setBeats: (beats: number) => void;
  setTonic: (tonicId: string) => void;
  setRaga: (ragaId: string) => void;
  setTaal: (taalId: string) => void;
  setDroneOn: (on: boolean) => void;
  setTablaOn: (on: boolean) => void;
  save: () => void;
  load: () => void;
  reset: () => void;
};

export const RagaStudioContext = createContext<RagaStudioContextValue | null>(null);
