import type { SimulationEvent, SimulationState, VarName, VariableValues } from './types';

export function initialState(variables: readonly VarName[]): SimulationState {
  return {
    position: 0,
    event: null,
    vars: Object.fromEntries(variables.map((v) => [v, null])),
    output: '',
    appended: '',
    outerPass: 0,
    innerPass: 0,
    symbolsPrinted: 0,
    finished: false,
  };
}

/** Apply exactly one event to a state, producing the next (new) state. */
export function applyEvent(state: SimulationState, event: SimulationEvent): SimulationState {
  let vars: VariableValues = state.vars;
  let output = state.output;
  let appended = '';
  let { outerPass, innerPass, symbolsPrinted } = state;
  let finished = false;

  switch (event.type) {
    case 'INIT_VARIABLE':
      vars = { ...vars, [event.variable]: event.value };
      if (event.loop === 'inner') innerPass = 0;
      break;
    case 'CONDITION_CHECK':
      if (event.result && event.loop === 'outer') {
        outerPass += 1;
        innerPass = 0;
      } else if (event.result && event.loop === 'inner') {
        innerPass += 1;
      }
      break;
    case 'INCREMENT':
    case 'DECREMENT':
      vars = { ...vars, [event.variable]: event.to };
      break;
    case 'OUTPUT':
      output += event.text;
      appended = event.text;
      // Count printf calls that print a visible symbol; pure spacing does not count.
      if (event.text.trim() !== '') symbolsPrinted += 1;
      break;
    case 'NEWLINE':
      output += event.text;
      appended = event.text;
      break;
    case 'PROGRAM_END':
      finished = true;
      break;
  }

  return {
    position: state.position + 1,
    event,
    vars,
    output,
    appended,
    outerPass,
    innerPass,
    symbolsPrinted,
    finished,
  };
}

/**
 * Build one immutable snapshot per position (0..events.length).
 * Previous Step simply selects an earlier snapshot, so it always restores the
 * exact earlier state — nothing is "undone" by hand.
 */
export function buildStates(variables: readonly VarName[], events: readonly SimulationEvent[]): SimulationState[] {
  const states: SimulationState[] = [initialState(variables)];
  for (const event of events) {
    states.push(applyEvent(states[states.length - 1]!, event));
  }
  return states;
}

/** Replay events from the start up to `position` (used to cross-check snapshots in tests). */
export function replayState(
  variables: readonly VarName[],
  events: readonly SimulationEvent[],
  position: number,
): SimulationState {
  const target = Math.max(0, Math.min(position, events.length));
  let state = initialState(variables);
  for (let k = 0; k < target; k++) {
    state = applyEvent(state, events[k]!);
  }
  return state;
}
