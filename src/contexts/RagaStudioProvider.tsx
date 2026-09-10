import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RagaStudioContext } from './RagaStudioContext';
import {
  clearGrid,
  clearSavedComposition,
  createComposition,
  loadComposition,
  notesAtBeat,
  pruneToRaga,
  saveComposition,
  setBeats as setBeatsPure,
  setBpm as setBpmPure,
  toggleCell as toggleCellPure,
  type Composition,
} from '../lib/sequencer';
import { RAGA_BY_ID, SWARAS, TONICS, swaraFrequency } from '../lib/ragas';
import { TAAL_BY_ID, playTablaStroke, strokeForBeat } from '../lib/audio/tabla';
import { playSwara } from '../lib/audio/synth';
import { Drone } from '../lib/audio/drone';
import { StepScheduler } from '../lib/audio/scheduler';
import { getAudioContext, resumeAudio } from '../lib/audio/context';

function tonicHzFor(tonicId: string): number {
  return (TONICS.find((t) => t.id === tonicId) ?? TONICS[0]).frequency;
}

export function RagaStudioProvider({ children }: { children: React.ReactNode }) {
  const [composition, setComposition] = useState<Composition>(() => loadComposition() ?? createComposition());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [hasSaved, setHasSaved] = useState(() => loadComposition() !== null);

  const compRef = useRef(composition);
  compRef.current = composition;
  const droneRef = useRef<Drone | null>(null);
  const schedulerRef = useRef<StepScheduler | null>(null);
  if (!droneRef.current) droneRef.current = new Drone();
  if (!schedulerRef.current) schedulerRef.current = new StepScheduler();

  const raga = RAGA_BY_ID[composition.ragaId] ?? RAGA_BY_ID.yaman;
  const tonic = TONICS.find((t) => t.id === composition.tonicId) ?? TONICS[0];
  const taal = TAAL_BY_ID[composition.taalId] ?? TAAL_BY_ID.teentaal;

  const scheduleStep = useCallback((step: number, when: number) => {
    const comp = compRef.current;
    const tonicHz = tonicHzFor(comp.tonicId);
    const beatLen = 60 / comp.bpm;
    for (const swara of notesAtBeat(comp, step)) {
      playSwara(swaraFrequency(swara, tonicHz), when, beatLen * 0.95);
    }
    if (comp.tablaOn) {
      const t = TAAL_BY_ID[comp.taalId] ?? TAAL_BY_ID.teentaal;
      playTablaStroke(strokeForBeat(t, step), when, tonicHz);
    }
  }, []);

  const stop = useCallback(() => {
    schedulerRef.current?.stop();
    setIsPlaying(false);
    setCurrentBeat(-1);
  }, []);

  const play = useCallback(() => {
    const comp = compRef.current;
    void schedulerRef.current
      ?.start({
        bpm: comp.bpm,
        stepCount: comp.beats,
        onStep: scheduleStep,
        onVisualStep: setCurrentBeat,
      })
      .then((ok) => {
        if (ok) setIsPlaying(true);
      });
  }, [scheduleStep]);

  // Keep the scheduler in sync with tempo/length changes during playback.
  useEffect(() => {
    schedulerRef.current?.setBpm(composition.bpm);
    schedulerRef.current?.setStepCount(composition.beats);
  }, [composition.bpm, composition.beats]);

  // Drone follows the on/off toggle and tonic, but only once audio has been unlocked by a gesture.
  useEffect(() => {
    const drone = droneRef.current!;
    const tonicHz = tonic.frequency;
    if (!composition.droneOn) {
      drone.stop();
      return;
    }
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    if (drone.isRunning) drone.setTonic(tonicHz);
    else drone.start(tonicHz);
  }, [composition.droneOn, tonic.frequency, isPlaying]);

  useEffect(() => {
    const drone = droneRef.current;
    const scheduler = schedulerRef.current;
    return () => {
      scheduler?.stop();
      drone?.stop();
    };
  }, []);

  const toggleCell = useCallback((row: number, beat: number) => {
    setComposition((c) => toggleCellPure(c, row, beat));
  }, []);

  const previewRow = useCallback((row: number) => {
    const swara = SWARAS[row];
    if (!swara) return;
    void resumeAudio().then((ctx) => {
      if (!ctx) return;
      playSwara(swaraFrequency(swara.id, tonicHzFor(compRef.current.tonicId)), ctx.currentTime, 0.6);
    });
  }, []);

  const clear = useCallback(() => setComposition((c) => clearGrid(c)), []);
  const setBpm = useCallback((bpm: number) => setComposition((c) => setBpmPure(c, bpm)), []);
  const setBeats = useCallback((beats: number) => setComposition((c) => setBeatsPure(c, beats)), []);
  const setTonic = useCallback((tonicId: string) => setComposition((c) => ({ ...c, tonicId })), []);
  const setRaga = useCallback((ragaId: string) => setComposition((c) => pruneToRaga(c, ragaId)), []);
  const setTaal = useCallback((taalId: string) => setComposition((c) => ({ ...c, taalId })), []);
  const setDroneOn = useCallback((on: boolean) => {
    if (on) void resumeAudio();
    setComposition((c) => ({ ...c, droneOn: on }));
  }, []);
  const setTablaOn = useCallback((on: boolean) => setComposition((c) => ({ ...c, tablaOn: on })), []);

  const save = useCallback(() => {
    saveComposition(compRef.current);
    setHasSaved(true);
  }, []);

  const load = useCallback(() => {
    const loaded = loadComposition();
    if (loaded) {
      stop();
      setComposition(loaded);
    }
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    clearSavedComposition();
    setHasSaved(false);
    setComposition(createComposition());
  }, [stop]);

  const value = useMemo(
    () => ({
      composition,
      raga,
      tonic,
      taal,
      isPlaying,
      currentBeat,
      hasSaved,
      toggleCell,
      previewRow,
      clear,
      play,
      stop,
      setBpm,
      setBeats,
      setTonic,
      setRaga,
      setTaal,
      setDroneOn,
      setTablaOn,
      save,
      load,
      reset,
    }),
    [
      composition,
      raga,
      tonic,
      taal,
      isPlaying,
      currentBeat,
      hasSaved,
      toggleCell,
      previewRow,
      clear,
      play,
      stop,
      setBpm,
      setBeats,
      setTonic,
      setRaga,
      setTaal,
      setDroneOn,
      setTablaOn,
      save,
      load,
      reset,
    ]
  );

  return <RagaStudioContext.Provider value={value}>{children}</RagaStudioContext.Provider>;
}
