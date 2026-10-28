import { describe, expect, it } from 'vitest';
import { ABSOLUTE_PARAM_MAX, defaultParams, validateParams, type ParamSpec } from '../validateParams';

const specs: ParamSpec[] = [
  { name: 'rows', label: 'Rows', description: '', min: 1, max: 10, default: 4 },
  { name: 'columns', label: 'Columns', description: '', min: 1, max: 50, default: 3 },
];

describe('validateParams', () => {
  it('accepts numbers and numeric strings within limits', () => {
    expect(validateParams(specs, { rows: 1, columns: '10' })).toEqual({ ok: true, values: { rows: 1, columns: 10 } });
    expect(validateParams(specs, { rows: ' 7 ', columns: 3 })).toEqual({ ok: true, values: { rows: 7, columns: 3 } });
  });

  it('enforces min, max and the absolute maximum', () => {
    const tooBig = validateParams(specs, { rows: 4, columns: ABSOLUTE_PARAM_MAX + 1 });
    expect(tooBig.ok).toBe(false);
    if (!tooBig.ok) expect(tooBig.errors.columns).toMatch(/between 1 and 10/);
    expect(validateParams(specs, { rows: 0, columns: 3 }).ok).toBe(false);
    expect(validateParams(specs, { rows: -3, columns: 3 }).ok).toBe(false);
  });

  it('rejects non-integers, text, missing and unknown values', () => {
    for (const bad of [3.5, '3.5', 'abc', '', NaN, Infinity, null, true]) {
      expect(validateParams(specs, { rows: bad, columns: 3 }).ok, String(bad)).toBe(false);
    }
    expect(validateParams(specs, { rows: 3 }).ok).toBe(false);
    const unknown = validateParams(specs, { rows: 3, columns: 3, colour: 2 });
    expect(unknown.ok).toBe(false);
  });

  it('builds default values', () => {
    expect(defaultParams(specs)).toEqual({ rows: 4, columns: 3 });
  });
});
