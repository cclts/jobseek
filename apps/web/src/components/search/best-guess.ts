export type BestGuessResult<T> = { match: T } | { ambiguous: true } | null;

export function findBestGuess<T extends { name: string }>(
  query: string,
  items: T[],
): BestGuessResult<T> {
  if (!query.trim() || items.length === 0) return null;
  if (items.length === 1) return { match: items[0] };
  const q = query.trim().toLowerCase();
  const exact = items.filter((it) => it.name.toLowerCase() === q);
  if (exact.length === 1) return { match: exact[0] };
  return { ambiguous: true };
}
