import { ArrowRight, BookOpen, Cpu, ExternalLink, Eye, GraduationCap, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CreatorAvatar } from '../components/CreatorAvatar';
import { GithubIcon } from '../components/GithubIcon';
import { LiveDemo } from '../components/LiveDemo';
import { PatternCard } from '../components/PatternCard';
import { VisitorCounter } from '../components/VisitorCounter';
import { CREATOR, ORGANISATION } from '../branding';
import { FEATURED_PATTERN_IDS, PATTERNS, getPattern } from '../patterns';
import { useCompletedPatterns } from '../utils/progress';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const STEPS = [
  {
    icon: BookOpen,
    title: 'Understand',
    text: 'Read the C program, its expected output, and a plain-English explanation of the outer loop, inner loop, printf and newline.',
  },
  {
    icon: Eye,
    title: 'Visualize',
    text: 'Run the program one step at a time. Watch the highlighted code, the values of i and j, every condition check and the output appear.',
  },
  {
    icon: GraduationCap,
    title: 'Practise',
    text: 'Predict the next step, answer questions with hints, and change the number of rows to see how the pattern responds.',
  },
];

const HIGHLIGHTS = [
  { icon: Cpu, title: `${PATTERNS.length} verified patterns`, text: 'From rectangles and triangles to pyramids and diamonds.' },
  { icon: Zap, title: 'Every step is real', text: 'Each highlight comes from an actual execution event.' },
  { icon: ShieldCheck, title: 'No login needed', text: 'Runs in your browser. No personal data is collected.' },
];

export function HomePage() {
  useDocumentTitle();
  const [completed] = useCompletedPatterns();
  const featured = FEATURED_PATTERN_IDS.map((id) => getPattern(id)!);
  const first = PATTERNS[0]!;
  const triangle = getPattern('star-triangle')!;

  return (
    <>
      {/* Hero */}
      <section className="container-page grid gap-10 pt-10 pb-14 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pt-20">
        <div>
          <p className="chip bg-cyan-300/10 text-cyan-200 ring-cyan-300/30">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Learn C in the age of AI
          </p>
          <h1 className="mt-4 text-[2.4rem] leading-[1.05] font-bold tracking-tight xs:text-5xl sm:text-6xl xl:text-7xl">
            C Programming <span className="neon-text">Pattern Lab</span>
          </h1>
          <p className="mt-4 font-display text-lg font-medium text-cyan-100 sm:text-xl">
            See the code. Follow the loop. Understand the pattern.
          </p>
          <p className="mt-4 max-w-xl text-slate-300">
            Pattern programs are the classic way to learn nested <code className="font-mono text-cyan-200">for</code> loops.
            Here you don’t just read the answer — you run the program step by step and watch exactly how the outer and
            inner loops build every row.
          </p>
          <div className="mt-7 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <Link to={`/patterns/${first.id}`} className="btn-primary px-6 text-base">
              Start Learning <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
            <Link to="/patterns" className="btn-secondary px-6 text-base">
              Browse all {PATTERNS.length} patterns
            </Link>
          </div>
          <div className="mt-5">
            <VisitorCounter />
          </div>
          <p className="mt-5 flex max-w-xl items-start gap-2 text-sm text-slate-400">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />
            <span>
              The lab simulates a set of verified example programs. It does not compile or run C code that you type. No
              login is needed and no personal information is collected.
            </span>
          </p>
        </div>
        <div className="min-w-0">
          <LiveDemo pattern={triangle} />
          <Link to={`/patterns/${triangle.id}`} className="btn-secondary mt-4 w-full">
            Step through this program yourself <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Highlights */}
      <section aria-label="Highlights" className="container-page">
        <ul className="grid gap-3 sm:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <li key={h.title} className="glass flex items-start gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 ring-1 ring-white/10">
                <h.icon aria-hidden="true" className="h-5 w-5 text-cyan-200" />
              </span>
              <span>
                <span className="block font-display font-semibold text-white">{h.title}</span>
                <span className="block text-sm text-slate-400">{h.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="container-page py-16" aria-labelledby="how-title">
        <p className="panel-title">How it works</p>
        <h2 id="how-title" className="mt-2 text-3xl font-bold sm:text-4xl">
          Understand → Visualize → <span className="neon-text">Practise</span>
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, k) => (
            <li key={step.title} className="glass relative overflow-hidden p-6">
              <span aria-hidden="true" className="absolute -top-4 -right-1 font-display text-8xl font-bold text-white/[0.04]">
                0{k + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-violet text-slate-950 shadow-[0_0_30px_-6px_rgba(34,227,255,0.8)]">
                <step.icon aria-hidden="true" className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-xl font-bold">
                <span className="sr-only">Step {k + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Featured patterns */}
      <section className="container-page" aria-labelledby="featured-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="panel-title">Start here</p>
            <h2 id="featured-title" className="mt-2 text-3xl font-bold sm:text-4xl">
              Featured patterns
            </h2>
          </div>
          <Link to="/patterns" className="btn-ghost text-cyan-200">
            See the full library <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PatternCard key={p.id} pattern={p} completed={completed.includes(p.id)} />
          ))}
        </div>
      </section>

      {/* Creator spotlight */}
      <section className="container-page pt-16" aria-labelledby="creator-title">
        <div className="neon-border relative overflow-hidden rounded-3xl p-6 sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgb(244 114 208 / 0.25), transparent 65%)' }}
          />
          <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <CreatorAvatar size="lg" />
            <div>
              <p className="panel-title">The mind behind the lab</p>
              <h2 id="creator-title" className="mt-2 text-3xl font-bold sm:text-4xl">
                Crafted by <span className="neon-text">{CREATOR.name}</span>
              </h2>
              <p className="mt-2 font-medium text-slate-200">{CREATOR.headline}</p>
              <p className="mt-3 max-w-2xl text-slate-300">
                An educator with {CREATOR.experience.charAt(0).toLowerCase() + CREATOR.experience.slice(1)} This lab turns
                years of classroom experience into an interactive way to truly see how nested loops think — built with the
                same AI-era engineering behind {ORGANISATION.name}.
              </p>
              <div className="mt-6 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
                <Link to="/creator" className="btn-primary">
                  Meet the creator <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <a href={CREATOR.github.url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <GithubIcon /> GitHub
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <a href={ORGANISATION.url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <ExternalLink aria-hidden="true" className="h-4 w-4" /> {ORGANISATION.shortName}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
