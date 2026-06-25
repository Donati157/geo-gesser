// Busca a foto de um tema na Wikipedia (pt) — grátis, com CORS. Cacheia.
const cache = new Map<string, Promise<string | null>>();

export function wikiPhoto(title: string): Promise<string | null> {
  if (!cache.has(title)) {
    const url = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const p = fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: any) => d?.originalimage?.source || d?.thumbnail?.source || null)
      .catch(() => null);
    cache.set(title, p);
  }
  return cache.get(title)!;
}
