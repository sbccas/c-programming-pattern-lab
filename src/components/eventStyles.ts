import type { CodePartKind, SimulationEvent } from '../engine/types';

/** Text label + colours for each kind of code part / event. Colour is never the only cue. */
export const PART_KIND_STYLES: Record<CodePartKind, { label: string; chip: string; code: string; swatch: string }> = {
  declare: { label: 'Declaration', chip: 'bg-slate-400/10 text-slate-200 ring-slate-400/30', code: 'bg-slate-400/20 text-slate-100', swatch: 'bg-slate-400' },
  init: { label: 'Initialise', chip: 'bg-sky-400/10 text-sky-300 ring-sky-400/40', code: 'bg-sky-400/20 text-sky-200', swatch: 'bg-sky-400' },
  condition: { label: 'Condition', chip: 'bg-amber-300/10 text-amber-200 ring-amber-300/40', code: 'bg-amber-300/20 text-amber-100', swatch: 'bg-amber-300' },
  update: { label: 'Update', chip: 'bg-violet-400/10 text-violet-300 ring-violet-400/40', code: 'bg-violet-400/25 text-violet-100', swatch: 'bg-violet-400' },
  output: { label: 'Print', chip: 'bg-lime-400/10 text-lime-300 ring-lime-400/40', code: 'bg-lime-400/20 text-lime-100', swatch: 'bg-lime-400' },
  newline: { label: 'Newline', chip: 'bg-teal-300/10 text-teal-200 ring-teal-300/40', code: 'bg-teal-300/20 text-teal-100', swatch: 'bg-teal-300' },
  return: { label: 'End', chip: 'bg-pink-400/10 text-pink-300 ring-pink-400/40', code: 'bg-pink-400/20 text-pink-100', swatch: 'bg-pink-400' },
};

export function eventKind(event: SimulationEvent): CodePartKind {
  switch (event.type) {
    case 'INIT_VARIABLE':
      return 'init';
    case 'CONDITION_CHECK':
      return 'condition';
    case 'INCREMENT':
    case 'DECREMENT':
      return 'update';
    case 'OUTPUT':
      return 'output';
    case 'NEWLINE':
      return 'newline';
    case 'PROGRAM_END':
      return 'return';
  }
}

/** Beginner-friendly name of the operation for an event. */
export function operationName(event: SimulationEvent): string {
  switch (event.type) {
    case 'INIT_VARIABLE':
      return `Initialise ${event.variable}`;
    case 'CONDITION_CHECK':
      return event.loop === 'inner' ? 'Check inner condition' : 'Check outer condition';
    case 'INCREMENT':
      return `Increment ${event.variable}`;
    case 'DECREMENT':
      return `Decrement ${event.variable}`;
    case 'OUTPUT':
      return 'Print';
    case 'NEWLINE':
      return 'Print newline';
    case 'PROGRAM_END':
      return 'End program';
  }
}

export const RESULT_STYLES = {
  true: 'bg-lime-400/15 text-lime-300 ring-lime-400/50',
  false: 'bg-rose-500/15 text-rose-300 ring-rose-400/50',
} as const;
