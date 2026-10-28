import type { ExplanationCard } from './types';

/** The code a card refers to, copied from the rendered program (never typed by hand). */
export function cardCode(card: ExplanationCard, partText: Readonly<Record<string, string>>): string {
  if (card.loopId) {
    const part = (name: string) => partText[`${card.loopId}.${name}`];
    const [init, condition, update] = [part('init'), part('condition'), part('update')];
    if (init === undefined || condition === undefined || update === undefined) {
      throw new Error(`Explanation card refers to unknown loop "${card.loopId}".`);
    }
    return `for (${init}; ${condition}; ${update})`;
  }
  if (card.partId) {
    const text = partText[card.partId];
    if (text === undefined) throw new Error(`Explanation card refers to unknown code part "${card.partId}".`);
    return text;
  }
  return '';
}
