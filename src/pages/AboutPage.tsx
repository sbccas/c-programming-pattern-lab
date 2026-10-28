import { Link } from 'react-router-dom';
import { CREATOR, ORGANISATION } from '../branding';
import { MAX_EVENTS } from '../engine/buildTimeline';
import { ABSOLUTE_PARAM_MAX } from '../engine/validateParams';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const SUPPORTED = [
  ['Variables', 'int i, j; — declared at the top of main(), with no starting value'],
  ['Loops', 'for loops, one inside another (an outer loop and an inner loop)'],
  ['Loop start', 'i = <number>, j = <number>'],
  ['Conditions', '<=, <, >= and > comparing a loop variable with a number or with i'],
  ['Updates', 'i++, i--, j++, j--'],
  ['Printing', 'printf("* "); printf("%d ", i); printf("%d ", j); printf("\\n");'],
  ['End', 'return 0;'],
];

const STEP_TYPES = [
  ['Initialise', 'A loop variable gets its starting value, e.g. j = 1.'],
  ['Condition', 'A loop condition is checked and is true or false. A false check is the moment that loop ends.'],
  ['Print', 'printf adds text to the output. Spaces are kept exactly.'],
  ['Newline', 'printf("\\n") moves the output to the next line.'],
  ['Update', 'i++ / j++ add 1; i-- subtracts 1.'],
  ['End', 'return 0; — the program finishes.'],
];

export function AboutPage() {
  useDocumentTitle('About');
  return (
    <div className="container-page max-w-4xl py-10">
      <h1 className="text-3xl font-bold text-white">About the lab</h1>
      <p className="mt-3 text-slate-300">
        C Programming Pattern Lab helps beginners understand nested <code className="font-mono">for</code> loops by
        running classic pattern programs one operation at a time. It is meant for first-year BCA, BSc IT and BSc Data
        Science students, and for teachers who want to demonstrate loop execution on a projector.
      </p>
      <p className="glass mt-5 p-4 text-sm text-slate-300">
        Idea, design and development: <Link to="/creator" className="font-semibold text-cyan-300 underline-offset-4 hover:underline">{CREATOR.name}</Link>{' '}
        ({CREATOR.headline}) ·{' '}
        <a href={ORGANISATION.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-300 underline-offset-4 hover:underline">
          {ORGANISATION.name}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>

      <section className="mt-8" aria-labelledby="sim-title">
        <h2 id="sim-title" className="text-xl font-bold">
          A simulator, not a compiler
        </h2>
        <p className="mt-2 text-slate-300">
          The lab does <strong>not</strong> compile or run C code you type. Each lesson is a verified program stored as
          structured data. The same data is used to display the C code and to produce the step-by-step timeline, so the
          code you see is exactly the program being simulated. Every program’s output and steps are checked by automated
          tests.
        </p>
        <h3 className="mt-5 font-semibold">Supported C features</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody>
              {SUPPORTED.map(([k, v]) => (
                <tr key={k} className="border-b border-white/10">
                  <th scope="row" className="py-2 pr-4 align-top font-semibold whitespace-nowrap">
                    {k}
                  </th>
                  <td className="py-2 font-mono text-[13px]">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="steps-title">
        <h2 id="steps-title" className="text-xl font-bold">
          What counts as one step?
        </h2>
        <p className="mt-2 text-slate-300">
          A step is one observable operation, not a whole row or a whole loop. The declaration <code className="font-mono">int i, j;</code>{' '}
          is the starting point (step 0), where i and j exist but have no value yet. After that, every step is one of:
        </p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {STEP_TYPES.map(([k, v]) => (
            <div key={k} className="card p-3">
              <dt className="font-semibold">{k}</dt>
              <dd className="text-sm text-slate-300">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-slate-300">
          For a for loop, the order is always: initialise once → check → body → update → check → … The inner loop is
          initialised again every time the outer loop body reaches it, which is why j starts from 1 on every row.
        </p>
      </section>

      <section className="mt-8" aria-labelledby="limits-title">
        <h2 id="limits-title" className="text-xl font-bold">
          Limitations
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
          <li>Only the programs in the pattern library can be simulated; their code cannot be edited.</li>
          <li>Settings such as the number of rows are limited to {ABSOLUTE_PARAM_MAX} so the dry-run table stays readable (a few lessons use 9).</li>
          <li>As a safety limit, a simulation stops after {MAX_EVENTS.toLocaleString()} steps (no included pattern comes close).</li>
          <li>Other C topics (while, if-else, arrays, functions) and more advanced patterns such as pyramids are planned for later versions.</li>
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="privacy-title">
        <h2 id="privacy-title" className="text-xl font-bold">
          Privacy
        </h2>
        <p className="mt-2 text-slate-300">
          No login, no personal information, no analytics and no tracking. Everything runs in your browser. Your settings
          (speed, display options) and progress (completed simulations and correctly answered questions) are saved only in
          this browser’s local storage. Clearing your browser data removes them, and they do not move to other devices. You
          can reset progress from the <Link to="/practice" className="font-semibold text-cyan-300 underline">Practice zone</Link>.
        </p>
      </section>

      <section className="mt-8" aria-labelledby="a11y-title">
        <h2 id="a11y-title" className="text-xl font-bold">
          Keyboard and accessibility
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
          <li>All controls can be used with the keyboard (Tab, Enter, Space).</li>
          <li>In the simulator, press → for Next Step and ← for Previous Step.</li>
          <li>Each step is announced to screen readers; conditions say “true” or “false” in words, not only in colour.</li>
          <li>Animations are reduced when your system asks for reduced motion.</li>
        </ul>
      </section>
    </div>
  );
}
