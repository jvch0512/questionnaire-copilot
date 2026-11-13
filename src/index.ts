import { fold, tokens } from "./text.js";

export interface Chunk { doc: string; title: string; heading: string; text: string; reviewed: string | null; tokens: string[] }
export interface Hit { chunk: Chunk; score: number; norm: number; matched: string[] }
export interface Doc { name: string; text: string }

export function parseDoc(d: Doc): Chunk[] {
  let text = d.text.replace(/\r\n/g, "\n");
  let reviewed: string | null = null, title = d.name;
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (fm) {
    const r = /^reviewed:\s*(\d{4}-\d{2}-\d{2})/m.exec(fm[1]!); if (r) reviewed = r[1]!;
    const t = /^title:\s*(.+)$/m.exec(fm[1]!); if (t) title = t[1]!.trim();
    text = text.slice(fm[0].length);
  }
  const chunks: Chunk[] = [];
  let heading = "";
  for (const block of text.split(/\n{2,}/)) {
    const b = block.trim();
    if (!b) continue;
    const h = /^#{1,4}\s+(.+)$/m.exec(b);
    if (h && b.startsWith("#")) { heading = h[1]!.trim(); const rest = b.replace(/^#{1,4}\s+.+\n?/, "").trim(); if (!rest) continue; chunks.push(mk(d.name, title, heading, rest, reviewed)); continue; }
    chunks.push(mk(d.name, title, heading, b, reviewed));
  }
  return chunks;
}

const mk = (doc: string, title: string, heading: string, text: string, reviewed: string | null): Chunk => ({ doc, title, heading, text, reviewed, tokens: tokens(`${heading} ${text}`) });

export class Index {
  chunks: Chunk[]; private df = new Map<string, number>(); private avg: number;
  constructor(chunks: Chunk[], private k1 = 1.5, private b = 0.75) {
    this.chunks = chunks;
    for (const c of chunks) for (const t of new Set(c.tokens)) this.df.set(t, (this.df.get(t) ?? 0) + 1);
    this.avg = chunks.reduce((n, c) => n + c.tokens.length, 0) / Math.max(1, chunks.length);
  }
  idf(t: string): number { const n = this.chunks.length, d = this.df.get(t) ?? 0; return Math.log(1 + (n - d + 0.5) / (d + 0.5)); }
  search(query: string, k = 3): Hit[] {
    const q = [...new Set(tokens(query))];
    const upper = q.reduce((n, t) => n + this.idf(t) * (this.k1 + 1), 0) || 1;
    const hits: Hit[] = [];
    for (const c of this.chunks) {
      const tf = new Map<string, number>(); for (const t of c.tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      let s = 0; const matched: string[] = [];
      for (const t of q) {
        const f = tf.get(t); if (!f) continue;
        matched.push(t);
        s += this.idf(t) * (f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + this.b * c.tokens.length / this.avg));
      }
      if (s > 0) hits.push({ chunk: c, score: s, norm: s / upper, matched });
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, k);
  }
}

export const sentences = (t: string): string[] => t.replace(/\n/g, " ").replace(/^[-*]\s+/gm, "").split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡0-9])/).map((s) => s.trim()).filter(Boolean);
export const lower = fold;
