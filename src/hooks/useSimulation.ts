import { useCallback, useEffect, useReducer } from 'react';
import type { Simulation, SimulationState } from '../engine/types';

export const SPEEDS = [
  { id: 'slow', label: 'Slow', ms: 2000 },
  { id: 'normal', label: 'Normal', ms: 1200 },
  { id: 'fast', label: 'Fast', ms: 600 },
  { id: 'very-fast', label: 'Very fast', ms: 300 },
] as const;

export type SpeedId = (typeof SPEEDS)[number]['id'];
export const DEFAULT_SPEED: SpeedId = 'normal';
export const isSpeedId = (v: unknown): v is SpeedId => SPEEDS.some((s) => s.id === v);
export const speedMs = (id: SpeedId): number => SPEEDS.find((s) => s.id === id)!.ms;

interface PlaybackState {
  position: number;
  playing: boolean;
}

type Action =
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'goto'; position: number }
  | { type: 'reset' }
  | { type: 'end' }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'tick' };

/** Pure reducer for the timeline cursor. `last` is the number of events. */
export function playbackReducer(state: PlaybackState, action: Action, last: number): PlaybackState {
  const clamp = (p: number) => Math.max(0, Math.min(last, p));
  switch (action.type) {
    case 'next':
      return { position: clamp(state.position + 1), playing: false };
    case 'previous':
      return { position: clamp(state.position - 1), playing: false };
    case 'goto':
      return { position: clamp(action.position), playing: false };
    case 'reset':
      return { position: 0, playing: false };
    case 'end':
      return { position: last, playing: false };
    case 'play':
      // Playing from the end starts again from the beginning.
      return { position: state.position >= last ? 0 : state.position, playing: last > 0 };
    case 'pause':
      return { ...state, playing: false };
    case 'tick': {
      if (!state.playing) return state;
      const position = clamp(state.position + 1);
      return { position, playing: position < last };
    }
  }
}

export interface SimulationControls {
  state: SimulationState;
  position: number;
  total: number;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  next: () => void;
  previous: () => void;
  goto: (position: number) => void;
  reset: () => void;
  end: () => void;
  play: () => void;
  pause: () => void;
}

/**
 * Timeline cursor for one simulation. Every panel reads `state`, which is a
 * precomputed snapshot — so manual stepping, Previous Step and Auto Run all
 * show exactly the same states in the same order.
 *
 * The component using this hook should be keyed by pattern + parameters so a
 * new simulation always starts from a fresh, paused state.
 */
export function useSimulation(simulation: Simulation, delayMs: number): SimulationControls {
  const total = simulation.events.length;
  const [playback, dispatch] = useReducer(
    (s: PlaybackState, a: Action) => playbackReducer(s, a, total),
    { position: 0, playing: false },
  );

  // Auto Run: one timer per step; cleared on pause, reset, step, unmount.
  useEffect(() => {
    if (!playback.playing) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), delayMs);
    return () => window.clearTimeout(timer);
  }, [playback.playing, playback.position, delayMs]);

  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const previous = useCallback(() => dispatch({ type: 'previous' }), []);
  const goto = useCallback((position: number) => dispatch({ type: 'goto', position }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const end = useCallback(() => dispatch({ type: 'end' }), []);
  const play = useCallback(() => dispatch({ type: 'play' }), []);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);

  return {
    state: simulation.states[playback.position]!,
    position: playback.position,
    total,
    playing: playback.playing,
    atStart: playback.position === 0,
    atEnd: playback.position === total,
    next,
    previous,
    goto,
    reset,
    end,
    play,
    pause,
  };
}
