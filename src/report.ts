import { Answer } from "./answer.js";
import { toCsv } from "./csv.js";

export function answersCsv(a: Answer[]): string {
  return toCsv([["id", "question", "answer", "confidence", "status", "source", "evidence", "flags"], ...a.map((x) => [x.q.id, x.q.text, x.answer, String(x.confidence), x.status, x.source, x.quote, x.flags.join(" ")])]);
}

export function reviewMarkdown(a: Answer[], today: string): string {
  const n = (s: string) => a.filter((x) => x.status === s).length;
  const L = ["# Questionnaire draft", "", `${a.length} questions: ${n("auto")} ready to send, ${n("review")} to review, ${n("manual")} need an owner. Date of check: ${today}.`, "", "| # | Question | Answer | Conf. | Status | Source | Flags |", "|---|---|---|---|---|---|---|"];
  for (const x of a) L.push(`| ${x.q.id} | ${x.q.text.replace(/\|/g, "/")} | ${x.answer.replace(/\|/g, "/").slice(0, 140)} | ${x.confidence} | ${x.status} | ${x.source || "-"} | ${x.flags.join(", ") || "-"} |`);
  const rev = a.filter((x) => x.status !== "auto");
  if (rev.length) { L.push("", "## Needs a human", ""); for (const x of rev) L.push(`- **${x.q.id}** ${x.q.text} ${x.flags.length ? `(${x.flags.join(", ")})` : ""}${x.quote ? ` Evidence found: "${x.quote.slice(0, 180)}"` : ""}`); }
  L.push("", "Answers are extracted from your own documents with citations. Check every answer against the current state of your controls before sending; an answer the evidence does not support is a misstatement.");
  return L.join("\n") + "\n";
}
