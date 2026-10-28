import { describe, expect, it } from 'vitest';
import { executePattern, outputRows } from '../../engine/executePattern';
import { defaultParams } from '../../engine/validateParams';
import { PATTERNS, getNeighbours, getPattern } from '..';

/** C programs copied verbatim from the PRD (section 10). */
const PRD_SOURCES: Record<string, { params: Record<string, number>; source: string; output: string }> = {
  rectangle: {
    params: { rows: 3, columns: 4 },
    source: `#include <stdio.h>

int main(void)
{
    int i, j;

    for (i = 1; i <= 3; i++)
    {
        for (j = 1; j <= 4; j++)
        {
            printf("* ");
        }
        printf("\\n");
    }

    return 0;
}
`,
    output: '* * * *\n* * * *\n* * * *',
  },
  'star-triangle': {
    params: { rows: 4 },
    source: `#include <stdio.h>

int main(void)
{
    int i, j;

    for (i = 1; i <= 4; i++)
    {
        for (j = 1; j <= i; j++)
        {
            printf("* ");
        }
        printf("\\n");
    }

    return 0;
}
`,
    output: '*\n* *\n* * *\n* * * *',
  },
  'number-triangle': {
    params: { rows: 4 },
    source: `#include <stdio.h>

int main(void)
{
    int i, j;

    for (i = 1; i <= 4; i++)
    {
        for (j = 1; j <= i; j++)
        {
            printf("%d ", j);
        }
        printf("\\n");
    }

    return 0;
}
`,
    output: '1\n1 2\n1 2 3\n1 2 3 4',
  },
  'inverted-triangle': {
    params: { rows: 4 },
    source: `#include <stdio.h>

int main(void)
{
    int i, j;

    for (i = 4; i >= 1; i--)
    {
        for (j = 1; j <= i; j++)
        {
            printf("* ");
        }
        printf("\\n");
    }

    return 0;
}
`,
    output: '* * * *\n* * *\n* *\n*',
  },
  'repeated-row-number': {
    params: { rows: 4 },
    source: '',
    output: '1\n2 2\n3 3 3\n4 4 4 4',
  },
};

const trimRows = (output: string) => outputRows(output).map((r) => r.trimEnd()).join('\n');

describe('pattern library', () => {
  it('has unique ids and the six PRD patterns', () => {
    const ids = PATTERNS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ['rectangle', 'square', 'repeated-row-number', 'star-triangle', 'number-triangle', 'inverted-triangle']) {
      expect(ids).toContain(id);
    }
  });

  it('links previous / next patterns in order', () => {
    expect(getNeighbours(PATTERNS[0]!.id).previous).toBeUndefined();
    expect(getNeighbours(PATTERNS[0]!.id).next).toBe(PATTERNS[1]);
    expect(getNeighbours(PATTERNS[PATTERNS.length - 1]!.id).next).toBeUndefined();
    expect(getPattern('does-not-exist')).toBeUndefined();
  });

  for (const pattern of PATTERNS) {
    describe(pattern.title, () => {
      const sim = executePattern(pattern, defaultParams(pattern.params));

      it('engine output equals the hand-written expected output exactly (spaces and newlines)', () => {
        expect(sim.finalOutput).toBe(pattern.expectedOutput);
      });

      it('has the required teaching content', () => {
        expect(pattern.title).toBeTruthy();
        expect(pattern.description).toBeTruthy();
        expect(pattern.objective).toBeTruthy();
        expect(pattern.goals.length).toBeGreaterThan(0);
        expect(pattern.quiz.length).toBeGreaterThan(0);
        const explanation = pattern.explain(sim.params);
        for (const text of Object.values(explanation)) expect(text.length).toBeGreaterThan(10);
      });

      it('every event points at a code part that exists on the stated line', () => {
        for (const e of sim.events) {
          const line = sim.source.lines[e.line - 1]!;
          const segment = line.segments.find((s) => s.partId === e.partId);
          expect(segment?.text).toBe(e.code);
        }
      });

      it('displayed code shows the current parameter values', () => {
        for (const spec of pattern.params) {
          const changed = { ...defaultParams(pattern.params), [spec.name]: spec.max };
          const s = executePattern(pattern, changed);
          expect(s.source.text).toContain(String(spec.max));
        }
      });
    });
  }

  for (const [id, fixture] of Object.entries(PRD_SOURCES)) {
    it(`${id}: matches the PRD baseline output${fixture.source ? ' and C source exactly' : ''}`, () => {
      const sim = executePattern(getPattern(id)!, fixture.params);
      expect(trimRows(sim.finalOutput)).toBe(fixture.output);
      if (fixture.source) expect(sim.source.text).toBe(fixture.source);
    });
  }

  it('the square uses the same code shape as the rectangle', () => {
    const sq = executePattern(getPattern('square')!, { size: 3 });
    const rect = executePattern(getPattern('rectangle')!, { rows: 3, columns: 3 });
    expect(sq.source.text).toBe(rect.source.text);
    expect(sq.events.map((e) => e.explanation)).toEqual(rect.events.map((e) => e.explanation));
  });
});
