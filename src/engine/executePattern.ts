import { buildTimeline } from './buildTimeline';
import { renderSource } from './renderSource';
import { buildStates } from './replayState';
import type { ParamValues, PatternProgram, Simulation } from './types';
import { validateParams, type ParamSpec } from './validateParams';

/** The parts of a pattern definition the engine needs. */
export interface ExecutablePattern {
  id: string;
  program: PatternProgram;
  params: readonly ParamSpec[];
}

/**
 * Pattern definition + parameters → validated model → event timeline → states.
 * Throws a `SimulationError` (plain-language message) for invalid parameters.
 */
export function executePattern(pattern: ExecutablePattern, rawParams: Readonly<Record<string, unknown>>): Simulation {
  const validation = validateParams(pattern.params, rawParams);
  if (!validation.ok) {
    throw new Error(Object.values(validation.errors).join(' '));
  }
  const params: ParamValues = validation.values;
  const source = renderSource(pattern.program, params);
  const events = buildTimeline(pattern.program, params, source);
  const states = buildStates(pattern.program.variables, events);
  const finalOutput = states[states.length - 1]!.output;
  return { patternId: pattern.id, params, source, events, states, finalOutput };
}

/** Split program output into rows (the text between newlines, spaces kept). */
export function outputRows(output: string): string[] {
  const rows = output.split('\n');
  if (rows[rows.length - 1] === '') rows.pop();
  return rows;
}
