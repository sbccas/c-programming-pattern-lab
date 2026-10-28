interface OutputPreviewProps {
  output: string;
  label: string;
  size?: 'sm' | 'md';
}

/** Program output shown as a static terminal block (trailing spaces are kept in the text). */
export function OutputPreview({ output, label, size = 'md' }: OutputPreviewProps) {
  return (
    <pre
      aria-label={label}
      className={`scanlines terminal-glow overflow-x-auto rounded-xl border border-lime-300/15 bg-black/50 font-mono text-lime-300 ${
        size === 'sm' ? 'p-3 text-xs leading-5' : 'p-4 text-base leading-7'
      }`}
    >
      {output}
    </pre>
  );
}
