/** Visible symbols used when "Show spaces" is on. The real output is never changed. */
export const SPACE_SYMBOL = '·';
export const NEWLINE_SYMBOL = '↵';

/** Describe printed text compactly for tables, e.g. "* " → `*·`, "\n" → `↵ newline`. */
export function visibleText(text: string): string {
  if (text === '\n') return `${NEWLINE_SYMBOL} newline`;
  return text.replace(/ /g, SPACE_SYMBOL);
}
