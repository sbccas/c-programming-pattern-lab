import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/routes';
import { executePattern } from '../engine/executePattern';
import { PATTERNS, getPattern } from '../patterns';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

const nextButton = () => screen.getByRole('button', { name: /next step/i });
const prevButton = () => screen.getByRole('button', { name: /previous/i });
const outputText = () => screen.queryByTestId('output-text')?.textContent ?? '';
const varText = (name: string) => screen.getByTestId(`var-${name}`).textContent ?? '';
const activePart = () => document.querySelector('[data-active-part]')?.textContent?.replace('Now running: ', '') ?? null;
const progress = () => screen.getByTestId('progress-text').textContent ?? '';

/** Advance fake timers one Auto Run tick at a time, letting React schedule each next timer. */
function advanceTicks(ms: number, ticks: number) {
  for (let k = 0; k < ticks; k++) act(() => vi.advanceTimersByTime(ms));
}

describe('simulator — every panel matches the engine at every step', () => {
  it('star triangle: forward through all steps, then backward to the start', async () => {
    const user = userEvent.setup();
    renderAt('/patterns/star-triangle');
    const sim = executePattern(getPattern('star-triangle')!, { rows: 4 });

    const expectStateMatches = (k: number) => {
      const state = sim.states[k]!;
      expect(progress()).toContain(`Step ${k} / ${sim.events.length}`);
      expect(outputText()).toBe(state.output);
      for (const v of ['i', 'j']) {
        const value = state.vars[v];
        if (value === null) expect(varText(v)).toContain('not set yet');
        else expect(varText(v)).toMatch(new RegExp(`^${value}`));
      }
      expect(activePart()).toBe(state.event ? state.event.code : null);
      const current = document.querySelector('tr[aria-current="step"]');
      if (k === 0) expect(current).toBeNull();
      else expect(current?.getAttribute('data-step')).toBe(String(k));
    };

    expectStateMatches(0);
    expect(prevButton()).toBeDisabled();
    for (let k = 1; k <= sim.events.length; k++) {
      await user.click(nextButton());
      expectStateMatches(k);
    }
    expect(nextButton()).toBeDisabled();
    expect(screen.getByText(/simulation complete/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Final output' })).toBeInTheDocument();

    for (let k = sim.events.length - 1; k >= 0; k--) {
      await user.click(prevButton());
      expectStateMatches(k);
    }
  }, 60_000);

  it('shows the PRD first-row condition results in the step explanation', async () => {
    const user = userEvent.setup();
    renderAt('/patterns/star-triangle');
    const explanation = () => screen.getByTestId('step-explanation');
    await user.click(nextButton()); // i = 1
    await user.click(nextButton()); // i <= 4
    expect(explanation()).toHaveTextContent('1 <= 4 → TRUE');
    for (let k = 0; k < 5; k++) await user.click(nextButton()); // j=1, check, print, j++, check
    expect(explanation()).toHaveTextContent('2 <= 1 → FALSE');
    expect(explanation()).toHaveTextContent(/inner loop ends/);
    await user.click(nextButton());
    expect(explanation()).toHaveTextContent('Print newline');
    expect(outputText()).toBe('* \n');
  });

  it('supports keyboard stepping with the arrow keys', async () => {
    const user = userEvent.setup();
    renderAt('/patterns/rectangle');
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(progress()).toContain('Step 3 /');
    await user.keyboard('{ArrowLeft}');
    expect(progress()).toContain('Step 2 /');
  });

  it('jumps to a step from the dry-run table and to the end', async () => {
    const user = userEvent.setup();
    renderAt('/patterns/number-triangle');
    for (let k = 0; k < 6; k++) await user.click(nextButton());
    await user.click(screen.getByRole('button', { name: 'Go to step 2' }));
    expect(progress()).toContain('Step 2 /');
    await user.click(screen.getByRole('button', { name: /^end/i }));
    expect(outputText()).toBe('1 \n1 2 \n1 2 3 \n1 2 3 4 \n');
  });
});

describe('Auto Run, Pause and Reset', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('advances on a timer using the same steps, pauses promptly, and resets', () => {
    renderAt('/patterns/star-triangle');
    const sim = executePattern(getPattern('star-triangle')!, { rows: 4 });

    fireEvent.click(screen.getByRole('button', { name: /auto run/i }));
    advanceTicks(1200, 5);
    expect(progress()).toContain('Step 5 /');
    expect(outputText()).toBe(sim.states[5]!.output);

    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    advanceTicks(1000, 20);
    expect(progress()).toContain('Step 5 /');

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(progress()).toContain('Step 0 /');
    expect(outputText()).toBe('');
    advanceTicks(1000, 20);
    expect(progress()).toContain('Step 0 /');
  });

  it('respects the speed setting and stops at the end', () => {
    renderAt('/patterns/rectangle?rows=1&columns=1');
    const sim = executePattern(getPattern('rectangle')!, { rows: 1, columns: 1 });
    fireEvent.change(screen.getByLabelText(/speed/i), { target: { value: 'very-fast' } });
    fireEvent.click(screen.getByRole('button', { name: /auto run/i }));
    advanceTicks(300, 2);
    expect(progress()).toContain('Step 2 /');
    advanceTicks(300, 100);
    expect(progress()).toContain(`Step ${sim.events.length} / ${sim.events.length}`);
    expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument();
    expect(outputText()).toBe('* \n');
  });

  it('stops the timer when leaving the page (unmount)', () => {
    const view = renderAt('/patterns/star-triangle');
    fireEvent.click(screen.getByRole('button', { name: /auto run/i }));
    view.unmount();
    expect(() => act(() => vi.advanceTimersByTime(10_000))).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('parameters', () => {
  it('changing rows updates the code, the expected output, and restarts the simulation', async () => {
    const user = userEvent.setup();
    renderAt('/patterns/star-triangle');
    await user.click(nextButton());
    await user.click(nextButton());
    await user.click(screen.getByRole('button', { name: 'Increase Rows' }));
    expect(progress()).toContain('Step 0 /');
    expect(screen.getByLabelText('C source code')).toHaveTextContent('for (i = 1; i <= 5; i++)');
    expect(screen.getByLabelText('Expected output').textContent).toBe('* \n* * \n* * * \n* * * * \n* * * * * \n');
  });

  it('rejects invalid typed values with a message and keeps the simulation', async () => {
    const user = userEvent.setup();
    renderAt('/patterns/star-triangle');
    const input = screen.getByLabelText('Rows');
    await user.clear(input);
    await user.type(input, '25');
    expect(screen.getByRole('alert')).toHaveTextContent(/between 1 and 10/);
    expect(screen.getByLabelText('C source code')).toHaveTextContent('i <= 2;');
  });

  it('falls back to defaults when the URL has an invalid setting', () => {
    renderAt('/patterns/star-triangle?rows=500');
    expect(screen.getByRole('alert')).toHaveTextContent(/default settings/);
    expect(screen.getByLabelText('C source code')).toHaveTextContent('i <= 4');
  });

  it('reads a valid setting from the URL', () => {
    renderAt('/patterns/inverted-triangle?rows=6');
    expect(screen.getByLabelText('C source code')).toHaveTextContent('for (i = 6; i >= 1; i--)');
  });
});

describe('prediction mode', () => {
  it('asks about the next real event and gives feedback with hints', async () => {
    const user = userEvent.setup();
    renderAt('/patterns/star-triangle');
    await user.click(screen.getByRole('checkbox', { name: /prediction mode/i }));
    await user.click(nextButton()); // now the next event is the check 1 <= 4
    const prompt = screen.getByRole('region', { name: /predict step 2/i });
    await user.click(within(prompt).getByRole('button', { name: 'False' }));
    expect(within(prompt).getByText(/not quite/i)).toBeInTheDocument();
    expect(within(prompt).getByText(/hint/i)).toBeInTheDocument();
    await user.click(within(prompt).getByRole('button', { name: 'True' }));
    expect(within(prompt).getByText(/correct/i)).toBeInTheDocument();
    await user.click(within(prompt).getByRole('button', { name: /run step 2/i }));
    expect(screen.getByTestId('step-explanation')).toHaveTextContent('1 <= 4 → TRUE');
  });
});

describe('quiz feedback', () => {
  it('shows a hint after a wrong answer, allows retry, then confirms the right answer', async () => {
    const user = userEvent.setup();
    renderAt('/patterns/star-triangle');
    const card = screen.getByRole('article', { name: /on row 3/i });
    await user.click(within(card).getByRole('radio', { name: '4' }));
    await user.click(within(card).getByRole('button', { name: /check answer/i }));
    expect(within(card).getByText(/not quite/i)).toBeInTheDocument();
    expect(within(card).getByText(/hint:/i)).toBeInTheDocument();
    await user.click(within(card).getByRole('radio', { name: '3' }));
    await user.click(within(card).getByRole('button', { name: /check answer/i }));
    expect(within(card).getByText(/correct!/i)).toBeInTheDocument();
    expect(within(card).getByText(/why:/i)).toBeInTheDocument();
  });
});

describe('navigation and pages', () => {
  it('home page has the product promise and a Start Learning link', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: /c programming pattern lab/i })).toBeInTheDocument();
    expect(screen.getAllByText(/see the code\. follow the loop\. understand the pattern\./i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /start learning/i })).toHaveAttribute('href', '/patterns/rectangle');
    expect(screen.getAllByText(/does not compile or run C code/i).length).toBeGreaterThan(0);
  });

  it('library filters patterns by category and difficulty', async () => {
    const user = userEvent.setup();
    renderAt('/patterns');
    expect(screen.getAllByRole('link', { name: /open lesson/i })).toHaveLength(PATTERNS.length);
    await user.click(screen.getByRole('button', { name: 'Decreasing patterns' }));
    expect(screen.getAllByRole('link', { name: /open lesson/i })).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Beginner' }));
    expect(screen.queryAllByRole('link', { name: /open lesson/i })).toHaveLength(0);
    expect(screen.getByText(/no patterns match/i)).toBeInTheDocument();
  });

  it('opens a lesson from the library and links to the next pattern', async () => {
    const user = userEvent.setup();
    renderAt('/patterns');
    await user.click(screen.getByRole('link', { name: 'Open lesson: Rectangle of Stars' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Rectangle of Stars' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /next pattern/i }));
    expect(screen.getByRole('heading', { level: 1, name: 'Square of Stars' })).toBeInTheDocument();
    expect(progress()).toContain('Step 0 /');
  });

  it('shows a helpful 404 for unknown patterns and routes', () => {
    renderAt('/patterns/pyramid');
    expect(screen.getByText(/there is no pattern called/i)).toBeInTheDocument();
  });

  it('practice zone filters by question type', async () => {
    const user = userEvent.setup();
    renderAt('/practice');
    const all = screen.getAllByRole('article').length;
    await user.click(screen.getByRole('button', { name: 'Spot the mistake' }));
    const filtered = screen.getAllByRole('article').length;
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(all);
  });

  it('credits the creator on every page with working external links', () => {
    renderAt('/patterns');
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText(/designed & developed by/i)).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'Hitesh Patel' })).toHaveAttribute('href', '/creator');
    const github = within(footer).getByRole('link', { name: /github\.com\/contact2hitech/i });
    expect(github).toHaveAttribute('href', 'https://github.com/contact2hitech');
    expect(github).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(within(footer).getByRole('link', { name: /hi-tech ai solutions & services/i })).toHaveAttribute(
      'href',
      'https://hi-tech-ai-solutions.github.io/',
    );
  });

  it('creator page introduces the faculty member and the organisation', () => {
    renderAt('/creator');
    expect(screen.getByRole('heading', { level: 1, name: 'Hitesh Patel' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Assistant Professor & Coordinator, BSc Data Science' })).toBeInTheDocument();
    expect(screen.getByText('Sutex College of Computer Applications & Science')).toBeInTheDocument();
    expect(screen.getAllByText(/Jivan Jyot Trust/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('img', { name: 'Portrait of Hitesh Patel' })[0]).toHaveAttribute('src', '/images/hitesh-patel.gif');
    expect(screen.getAllByRole('link', { name: /hitech\.nft@gmail\.com/ })[0]).toHaveAttribute('href', 'mailto:hitech.nft@gmail.com');
    expect(screen.getByText(/two decades of experience/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /hi-tech ai solutions & services/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /visit hi-tech-ai-solutions\.github\.io/i })).toHaveAttribute(
      'href',
      'https://hi-tech-ai-solutions.github.io/',
    );
  });

  it('mobile menu opens, lists every page and closes after navigating', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const menu = screen.getByRole('navigation', { name: 'Main mobile' });
    for (const name of ['Patterns', 'Practice', 'Creator', 'About']) expect(within(menu).getByRole('link', { name })).toBeInTheDocument();
    await user.click(within(menu).getByRole('link', { name: 'Creator' }));
    expect(screen.queryByRole('navigation', { name: 'Main mobile' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Hitesh Patel' })).toBeInTheDocument();
  });

  it('mobile panel tabs switch the selected panel', async () => {
    const user = userEvent.setup();
    renderAt('/patterns/rectangle');
    const tab = screen.getByRole('tab', { name: 'Dry run' });
    await user.click(tab);
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Code' })).toHaveAttribute('aria-selected', 'false');
    expect(document.getElementById('panel-dry-run')?.className).toMatch(/^block/);
    expect(document.getElementById('panel-code')?.className).toMatch(/^hidden/);
  });
});
