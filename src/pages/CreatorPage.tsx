import { ArrowRight, BrainCircuit, Building2, Code2, ExternalLink, GraduationCap, Lightbulb, Mail, MapPin, Network, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CREATOR, ORGANISATION } from '../branding';
import { CreatorAvatar } from '../components/CreatorAvatar';
import { GithubIcon } from '../components/GithubIcon';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const FOCUS_ICONS = [BrainCircuit, GraduationCap, Network, Code2];

const IDEA_POINTS = [
  {
    title: 'Understanding beats memorising',
    text: 'AI tools can write a pattern program in a second. What students still need is the ability to read code and predict exactly what it will do — the skill every programmer, and every good AI user, relies on.',
  },
  {
    title: 'Make the invisible visible',
    text: 'A nested loop runs dozens of tiny steps that a blackboard cannot show at once. The lab shows every initialisation, condition check, print and update — in order, with the real values of i and j.',
  },
  {
    title: 'Built from the classroom',
    text: 'The lessons follow the way pattern programs are taught to first-year BCA, BSc IT and BSc Data Science students: understand, visualize, then practise.',
  },
];

export function CreatorPage() {
  useDocumentTitle(`About the creator — ${CREATOR.name}`);

  return (
    <div className="container-page py-10 sm:py-16">
      {/* Profile hero */}
      <section aria-labelledby="creator-name" className="neon-border relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-24 h-80 w-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgb(34 227 255 / 0.2), transparent 65%)' }}
        />
        <div className="relative grid items-center gap-8 text-center md:grid-cols-[auto_1fr] md:text-left">
          <CreatorAvatar size="xl" />
          <div>
            <p className="panel-title">Faculty · Creator of this lab</p>
            <h1 id="creator-name" className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="neon-text">{CREATOR.name}</span>
            </h1>
            <p className="mt-2 font-display text-lg font-semibold text-cyan-100">{CREATOR.designation}</p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-400 md:justify-start">
              <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" /> {CREATOR.institution.place} · managed by{' '}
              {CREATOR.institution.trust}
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start" aria-label="Roles">
              {CREATOR.roles.map((r) => (
                <li key={r} className="chip bg-white/[0.05] text-slate-200 ring-white/15">
                  {r}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col justify-center gap-3 xs:flex-row xs:flex-wrap md:justify-start">
              <a href={CREATOR.github.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <GithubIcon /> {CREATOR.github.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={ORGANISATION.url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <ExternalLink aria-hidden="true" className="h-4 w-4" /> {ORGANISATION.shortName}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={`mailto:${CREATOR.email}`} className="btn-secondary">
                <Mail aria-hidden="true" className="h-4 w-4" /> {CREATOR.email}
              </a>
              <a href={CREATOR.x.url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <span aria-hidden="true" className="font-bold">𝕏</span> {CREATOR.x.label}
                <span className="sr-only"> on X (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <figure className="mx-auto mt-12 max-w-3xl text-center">
        <Quote aria-hidden="true" className="mx-auto h-8 w-8 text-violet-300" />
        <blockquote className="mt-3 font-display text-xl leading-snug font-medium text-white sm:text-2xl">
          “{CREATOR.quote}”
        </blockquote>
        <figcaption className="mt-3 text-sm text-slate-400">— {CREATOR.name}</figcaption>
      </figure>

      {/* Institution */}
      <section aria-labelledby="institution-title" className="glass mt-14 p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-violet text-slate-950 shadow-[0_0_30px_-6px_rgba(34,227,255,0.8)]">
            <Building2 aria-hidden="true" className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="panel-title">Teaches at</p>
            <h2 id="institution-title" className="mt-2 text-2xl font-bold">
              {CREATOR.designation}
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {CREATOR.institution.colleges.map((c) => (
                <li key={c} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                  <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-neon-violet shadow-[0_0_10px_rgba(167,139,250,0.9)]" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-400">
              {CREATOR.institution.place} · managed by <span className="font-semibold text-slate-200">{CREATOR.institution.trust}</span>
            </p>
          </div>
        </div>
      </section>

      {/* About */}
      <section aria-labelledby="about-creator" className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="glass p-6 sm:p-8">
          <h2 id="about-creator" className="text-2xl font-bold">
            About
          </h2>
          <div className="mt-3 space-y-3 leading-relaxed text-slate-300">
            <p>
              {CREATOR.name} is an Assistant Professor and the Coordinator of the BSc Data Science programme — and a software
              developer and AI-focused systems builder working where artificial intelligence, software engineering,
              education technology and institutional digital transformation meet.
            </p>
            <p>{CREATOR.experience} That classroom and campus experience now powers AI-native products and intelligent institutional workflows built under {ORGANISATION.name}.</p>
            <p>
              The long-term initiative is <strong className="text-white">JyotOS</strong> — an AI-native Institutional
              Operating System designed to bring academic, administrative and student services together on one intelligent
              platform.
            </p>
          </div>
        </div>

        <div className="glass p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Focus areas</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {CREATOR.focusAreas.map((f, k) => {
              const Icon = FOCUS_ICONS[k % FOCUS_ICONS.length]!;
              return (
                <li key={f.title} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                  <span>
                    <span className="block font-semibold text-white">{f.title}</span>
                    <span className="block text-sm text-slate-400">{f.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* The idea */}
      <section aria-labelledby="idea-title" className="mt-14">
        <p className="panel-title">Why this lab exists</p>
        <h2 id="idea-title" className="mt-2 text-3xl font-bold sm:text-4xl">
          The idea: learning to <span className="neon-text">think like the computer</span>
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {IDEA_POINTS.map((p) => (
            <li key={p.title} className="glass p-6">
              <Lightbulb aria-hidden="true" className="h-6 w-6 text-amber-300" />
              <h3 className="mt-3 text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Organisation */}
      <section aria-labelledby="org-title" className="mt-14">
        <div className="glass-strong grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="panel-title">Powered by</p>
            <h2 id="org-title" className="mt-2 text-3xl font-bold">
              {ORGANISATION.name}
            </h2>
            <p className="mt-2 font-display text-lg text-cyan-100">“{ORGANISATION.tagline}”</p>
            <p className="mt-3 text-slate-300">{ORGANISATION.summary}</p>
            <a href={ORGANISATION.url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6">
              Visit {ORGANISATION.label} <ExternalLink aria-hidden="true" className="h-4 w-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <ul className="grid gap-2" aria-label="Services">
            {ORGANISATION.services.map((s) => (
              <li key={s} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-neon-cyan shadow-[0_0_10px_rgba(34,227,255,0.9)]" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-12 flex justify-center">
        <Link to="/patterns" className="btn-secondary">
          Start exploring the patterns <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
