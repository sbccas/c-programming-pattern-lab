/**
 * Creator and organisation details shown across the app.
 * Source: the creator's public GitHub profile (github.com/contact2hitech) and
 * the Hi-Tech AI Solutions website. Keep this file as the single place to edit.
 */
export const CREATOR = {
  name: 'Hitesh Patel',
  initials: 'HP',
  designation: 'Assistant Professor & Coordinator, BSc Data Science',
  headline: 'Assistant Professor · Coordinator, BSc Data Science · AI Systems Builder',
  roles: ['Educator', 'AI Systems Builder', 'Institutional AI Architect', 'Founder, Hi-Tech AI Solutions & Services'],
  institution: {
    colleges: [
      'Prof. V. B. Shah Institute of Management',
      'R. V. Patel College of Commerce (English Medium)',
      'V. L. Shah College of Commerce (Gujarati Medium)',
      'Sutex College of Computer Applications & Science',
    ],
    place: 'Amroli, Surat',
    trust: 'Jivan Jyot Trust',
  },
  /** Animated portrait (public/images) plus a still frame for reduced-motion users. */
  photo: {
    animated: '/images/hitesh-patel.gif',
    still: '/images/hitesh-patel-still.webp',
    alt: 'Portrait of Hitesh Patel',
  },
  email: 'hitech.nft@gmail.com',
  location: 'Surat, Gujarat, India',
  quote: 'Building AI-native systems that turn real-world problems into intelligent, useful, and scalable solutions.',
  experience: 'Over two decades of experience in computer education, academic operations and software development.',
  github: { label: 'github.com/contact2hitech', url: 'https://github.com/contact2hitech' },
  x: { label: '@contact2hitesh', url: 'https://x.com/contact2hitesh' },
  focusAreas: [
    { title: 'AI Systems Engineering', text: 'AI-powered applications, intelligent workflows and agentic pipelines.' },
    { title: 'Education Technology', text: 'Student support, admissions, digital identity and academic analytics.' },
    { title: 'Institutional AI', text: 'Academic intelligence layers and data-driven institutional operations.' },
    { title: 'Full-Stack Development', text: 'Modern web applications, APIs and data-driven platforms.' },
  ],
} as const;

export const ORGANISATION = {
  name: 'Hi-Tech AI Solutions & Services',
  shortName: 'Hi-Tech AI Solutions',
  tagline: "We don't just build software. We build intelligent solutions.",
  url: 'https://hi-tech-ai-solutions.github.io/',
  label: 'hi-tech-ai-solutions.github.io',
  summary:
    'For over 20 years Hi-Tech has been a name in technology education and consulting. Today it engineers AI-based solutions, intelligent automation and institutional platforms — including JyotOS, an AI-native Institutional Operating System.',
  services: [
    'AI solutions & intelligent agents',
    'Workflow automation',
    'Academic & institutional platforms',
    'Analytics & dashboards',
    'Custom software development',
  ],
} as const;
