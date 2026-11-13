import { Hit, Index, lower, sentences } from "./index.js";
import { tokens } from "./text.js";

export type Polarity = "yes" | "no" | "partial";
export type Status = "auto" | "review" | "manual";
export interface Question { id: string; text: string; category: string }
export interface Answer {
  q: Question; answer: string; polarity: Polarity | null; confidence: number; status: Status;
  source: string; quote: string; flags: string[];
}

const NEG = /\b(no|not|never|nunca|ni|cannot|does not|do not|did not|don't|doesn't|aun no|todavia no|actualmente no|currently no)\b/;
const PLAN = /\b(plan|planned|planning|roadmap|in progress|underway|working towards|will be|future|prevista?|previsto|en curso|en proceso|proximamente|estamos trabajando|se implementara|pendiente|target|objetivo)\b/;
const YESNO = /^(do|does|did|is|are|was|were|have|has|can|could|will|would|should|doe)\b|^¿?(dispone|existe|existen|cuenta|realiza|tiene|se |estan|esta|han|hay|puede|son|es)\b/;

export function isYesNo(q: string): boolean { return YESNO.test(lower(q.trim()).replace(/^¿/, "")); }

export function polarityOf(sentence: string): Polarity {
  const s = lower(sentence);
  if (PLAN.test(s) && !/\b(has been|have been|ha sido|han sido|completed|completado)\b/.test(s)) return NEG.test(s) ? "no" : "partial";
  if (NEG.test(s)) return "no";
  return "yes";
}

export function bestSentence(hit: Hit, query: string, ix?: Index): { text: string; coverage: number } {
  const qt = [...new Set(tokens(query))];
  const w = (t: string) => (ix ? ix.idf(t) : 1);
  const total = qt.reduce((n, t) => n + w(t), 0) || 1;
  let best = "", bs = -1, cov = 0;
  for (const s of sentences(hit.chunk.text)) {
    const st = new Set(tokens(s));
    const c = qt.filter((t) => st.has(t)).reduce((n, t) => n + w(t), 0) / total;
    const sc = c - 0.0005 * st.size;
    if (sc > bs) { bs = sc; best = s; cov = c; }
  }
  return { text: best || hit.chunk.text.slice(0, 240), coverage: cov };
}

const DAY = 86400000;
export function answerOne(ix: Index, q: Question, today: string, staleDays = 365): Answer {
  const hits = ix.search(q.text, 4);
  const top = hits[0];
  if (!top) return { q, answer: "Needs an owner: no evidence found in the policies provided.", polarity: null, confidence: 0, status: "manual", source: "", quote: "", flags: ["no-evidence"] };
  const sent = bestSentence(top, q.text, ix);
  const qConcepts = [...new Set(tokens(q.text).filter((t) => t.startsWith("c_")))];
  const sTokens = new Set(tokens(sent.text));
  const boost = qConcepts.length && qConcepts.every((c) => sTokens.has(c)) ? 0.15 : 0;
  const confidence = Math.round(Math.min(1, 0.65 * Math.min(1, sent.coverage * 1.15) + 0.35 * Math.min(1, top.norm * 1.8) + boost) * 100) / 100;
  const quote = sent.text;
  const flags: string[] = [];
  let polarity: Polarity | null = null, answer: string;
  if (isYesNo(q.text)) {
    polarity = polarityOf(quote);
    const others = hits.slice(1).filter((h) => h.norm > top.norm * 0.6).map((h) => bestSentence(h, q.text, ix)).filter((b) => b.coverage > 0.5).map((b) => polarityOf(b.text));
    if (others.some((p) => (p === "no") !== (polarity === "no") && p !== "partial" && polarity !== "partial")) flags.push("conflict");
    answer = polarity === "yes" ? "Yes" : polarity === "no" ? "No" : "Partial";
  } else answer = quote;
  if (top.chunk.reviewed && (Date.parse(today) - Date.parse(top.chunk.reviewed)) / DAY > staleDays) flags.push("stale-source");
  if (!top.chunk.reviewed) flags.push("undated-source");
  if (confidence < 0.45) flags.push("low-confidence");
  if (polarity === "partial") flags.push("planned-not-done");
  const status: Status = confidence < 0.45 ? "manual" : confidence < 0.6 || flags.some((f) => f === "conflict" || f === "stale-source" || f === "planned-not-done") ? "review" : "auto";
  return { q, answer: status === "manual" ? "Needs an owner: no reliable evidence in the policies provided." : answer, polarity, confidence, status, source: `${top.chunk.title} > ${top.chunk.heading || "(intro)"}`, quote, flags };
}

export function answerAll(ix: Index, qs: Question[], today: string): Answer[] { return qs.map((q) => answerOne(ix, q, today)); }
