import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import type { ParamValues } from '../engine/types';
import { ABSOLUTE_PARAM_MAX, validateParams, type ParamSpec } from '../engine/validateParams';

interface ParamControlsProps {
  specs: readonly ParamSpec[];
  values: ParamValues;
  onChange: (values: ParamValues) => void;
}

/**
 * Adjustable lesson settings. A valid change immediately rebuilds the timeline
 * (and so restarts the simulation); invalid input is explained and ignored.
 */
export function ParamControls({ specs, values, onChange }: ParamControlsProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const commit = (name: string, raw: string) => {
    const result = validateParams(specs, { ...values, [name]: raw });
    if (result.ok) {
      setErrors({});
      setDrafts((d) => ({ ...d, [name]: String(result.values[name]) }));
      if (result.values[name] !== values[name]) onChange(result.values);
    } else {
      setErrors({ [name]: result.errors[name] ?? 'Invalid value.' });
    }
  };

  return (
    <fieldset className="glass p-4">
      <legend className="sr-only">Pattern settings</legend>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        {specs.map((spec) => {
          const value = values[spec.name]!;
          const max = Math.min(spec.max, ABSOLUTE_PARAM_MAX);
          const inputId = `param-${spec.name}`;
          const errorId = `${inputId}-error`;
          const draft = drafts[spec.name] ?? String(value);
          return (
            <div key={spec.name}>
              <label htmlFor={inputId} className="block text-sm font-semibold text-white">
                {spec.label}
              </label>
              <p className="text-xs text-slate-400">
                {spec.description} ({spec.min}–{max})
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <button
                  type="button"
                  className="btn-secondary h-11 w-11 px-0"
                  aria-label={`Decrease ${spec.label}`}
                  disabled={value <= spec.min}
                  onClick={() => commit(spec.name, String(value - 1))}
                >
                  <Minus aria-hidden="true" className="h-4 w-4" />
                </button>
                <input
                  id={inputId}
                  type="number"
                  inputMode="numeric"
                  min={spec.min}
                  max={max}
                  step={1}
                  value={draft}
                  aria-invalid={errors[spec.name] ? true : undefined}
                  aria-describedby={errors[spec.name] ? errorId : undefined}
                  onChange={(e) => {
                    setDrafts((d) => ({ ...d, [spec.name]: e.target.value }));
                    if (e.target.value !== '') commit(spec.name, e.target.value);
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '' || errors[spec.name]) {
                      setDrafts((d) => ({ ...d, [spec.name]: String(value) }));
                      setErrors({});
                    }
                  }}
                  className="h-11 w-16 rounded-xl border border-white/15 bg-black/30 text-center font-mono text-lg text-white aria-invalid:border-rose-400"
                />
                <button
                  type="button"
                  className="btn-secondary h-11 w-11 px-0"
                  aria-label={`Increase ${spec.label}`}
                  disabled={value >= max}
                  onClick={() => commit(spec.name, String(value + 1))}
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
              {errors[spec.name] && (
                <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-rose-300">
                  {errors[spec.name]} The simulation still uses {value}.
                </p>
              )}
            </div>
          );
        })}
        <p className="text-xs text-slate-400 sm:ml-auto sm:max-w-xs">
          Changing a setting updates the C code and restarts the simulation from step 0.
        </p>
      </div>
    </fieldset>
  );
}
