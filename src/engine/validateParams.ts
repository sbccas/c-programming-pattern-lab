import type { ParamValues } from './types';

/** An adjustable lesson parameter, such as the number of rows. */
export interface ParamSpec {
  name: string;
  /** Label shown next to the control, e.g. "Rows". */
  label: string;
  /** Short help text, e.g. "How many times the outer loop runs." */
  description: string;
  min: number;
  max: number;
  default: number;
}

/** Hard upper limit for any parameter, so timelines stay small enough to read. */
export const ABSOLUTE_PARAM_MAX = 10;

export type ParamValidationResult =
  | { ok: true; values: ParamValues }
  | { ok: false; errors: Record<string, string> };

export function defaultParams(specs: readonly ParamSpec[]): ParamValues {
  return Object.fromEntries(specs.map((spec) => [spec.name, spec.default]));
}

/**
 * Validate raw parameter input (numbers or strings from a form / URL).
 * Every declared parameter must be a whole number within its limits.
 * Unknown parameters are rejected so typos are not silently ignored.
 */
export function validateParams(
  specs: readonly ParamSpec[],
  raw: Readonly<Record<string, unknown>>,
): ParamValidationResult {
  const errors: Record<string, string> = {};
  const values: Record<string, number> = {};

  for (const key of Object.keys(raw)) {
    if (!specs.some((spec) => spec.name === key)) {
      errors[key] = `"${key}" is not a setting for this pattern.`;
    }
  }

  for (const spec of specs) {
    const input = raw[spec.name];
    const max = Math.min(spec.max, ABSOLUTE_PARAM_MAX);
    let value: number;
    if (input === undefined || input === null || input === '') {
      errors[spec.name] = `${spec.label} is required.`;
      continue;
    }
    if (typeof input === 'number') {
      value = input;
    } else if (typeof input === 'string' && /^\s*-?\d+\s*$/.test(input)) {
      value = Number(input.trim());
    } else {
      errors[spec.name] = `${spec.label} must be a whole number.`;
      continue;
    }
    if (!Number.isInteger(value)) {
      errors[spec.name] = `${spec.label} must be a whole number.`;
    } else if (value < spec.min || value > max) {
      errors[spec.name] = `${spec.label} must be between ${spec.min} and ${max}.`;
    } else {
      values[spec.name] = value;
    }
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, values };
}
