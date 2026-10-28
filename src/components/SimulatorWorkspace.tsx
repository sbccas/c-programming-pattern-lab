import { useEffect, useState } from 'react';
import type { Simulation } from '../engine/types';
import { DEFAULT_SPEED, isSpeedId, speedMs, useSimulation } from '../hooks/useSimulation';
import { predictionFor } from '../quiz/predictions';
import { useCompletedPatterns } from '../utils/progress';
import { isBoolean } from '../utils/storage';
import { useStoredState } from '../utils/useStoredState';
import { CodePanel } from './CodePanel';
import { DryRunTable } from './DryRunTable';
import { ExecutionControls } from './ExecutionControls';
import { OutputPanel } from './OutputPanel';
import { PredictionPrompt } from './PredictionPrompt';
import { StepExplanation } from './StepExplanation';
import { VariableInspector } from './VariableInspector';

const TABS = [
  { id: 'code', label: 'Code' },
  { id: 'variables', label: 'Variables' },
  { id: 'output', label: 'Output' },
  { id: 'dry-run', label: 'Dry run' },
] as const;
type TabId = (typeof TABS)[number]['id'];

interface SimulatorWorkspaceProps {
  simulation: Simulation;
  variables: readonly string[];
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName));

/**
 * The simulator. Every panel reads the same `controls.state` snapshot.
 * The parent must key this component by pattern + parameters, so changing
 * either starts a fresh, paused simulation at step 0.
 */
export function SimulatorWorkspace({ simulation, variables }: SimulatorWorkspaceProps) {
  const [speed, setSpeed] = useStoredState('speed', DEFAULT_SPEED, isSpeedId);
  const [showSpaces, setShowSpaces] = useStoredState('show-spaces', false, isBoolean);
  const [showUpcoming, setShowUpcoming] = useStoredState('show-upcoming', false, isBoolean);
  const [predictMode, setPredictMode] = useStoredState('predict-mode', false, isBoolean);
  const [tab, setTab] = useState<TabId>('code');
  const [score, setScore] = useState({ correct: 0, answered: 0 });
  const [, markCompleted] = useCompletedPatterns();

  const controls = useSimulation(simulation, speedMs(speed));
  const { state, next, previous } = controls;

  useEffect(() => {
    if (state.finished) markCompleted(simulation.patternId);
  }, [state.finished, simulation.patternId, markCompleted]);

  // Keyboard: ← / → step through the program (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previous();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, previous]);

  const prediction = predictMode && !controls.playing ? predictionFor(simulation.events[controls.position], state) : null;

  const panelClass = (id: TabId) => `${tab === id ? 'block' : 'hidden'} lg:block`;
  const panelProps = (id: TabId) => ({
    id: `panel-${id}`,
    role: 'tabpanel' as const,
    'aria-labelledby': `tab-${id}`,
    className: panelClass(id),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <StepExplanation state={state} total={controls.total} />
        </div>
        <label className="glass flex min-h-11 cursor-pointer items-center gap-3 px-4 py-3 text-sm sm:max-w-64">
          <input
            type="checkbox"
            className="h-4 w-4 accent-violet-400"
            checked={predictMode}
            onChange={(e) => setPredictMode(e.target.checked)}
          />
          <span>
            <span className="font-display font-semibold text-white">Prediction mode</span>
            <span className="block text-xs text-slate-400">Guess each step before it runs.</span>
            {predictMode && score.answered > 0 && (
              <span className="block text-xs font-semibold text-violet-300">
                First-try score: {score.correct} / {score.answered}
              </span>
            )}
          </span>
        </label>
      </div>

      {prediction && (
        <PredictionPrompt
          key={prediction.step}
          prediction={prediction}
          onReveal={next}
          onAnswered={(ok) => setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), answered: s.answered + 1 }))}
        />
      )}

      {/* Mobile / tablet: one panel at a time. Desktop: all panels side by side. */}
      <div role="tablist" aria-label="Simulator panels" className="glass sticky top-[4.25rem] z-20 grid grid-cols-4 gap-1 p-1 lg:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`min-h-11 rounded-xl text-[13px] font-semibold transition-colors xs:text-sm ${tab === t.id ? 'bg-gradient-to-r from-neon-cyan/25 to-neon-violet/25 text-white ring-1 ring-cyan-300/50' : 'text-slate-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div {...panelProps('code')} className={`${panelClass('code')} lg:col-span-7`}>
          <CodePanel source={simulation.source} event={state.event} />
        </div>
        <div className="space-y-4 lg:col-span-5 lg:block">
          <div {...panelProps('variables')}>
            <VariableInspector state={state} variables={variables} />
          </div>
          <div {...panelProps('output')}>
            <OutputPanel state={state} showSpaces={showSpaces} onShowSpacesChange={setShowSpaces} />
          </div>
        </div>
        <div {...panelProps('dry-run')} className={`${panelClass('dry-run')} lg:col-span-12`}>
          <DryRunTable
            events={simulation.events}
            variables={variables}
            position={controls.position}
            showUpcoming={showUpcoming}
            onShowUpcomingChange={setShowUpcoming}
            onSelectStep={controls.goto}
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-30 -mx-2 sm:bottom-2 sm:mx-0">
        <ExecutionControls controls={controls} speed={speed} onSpeedChange={setSpeed} />
      </div>
    </div>
  );
}
