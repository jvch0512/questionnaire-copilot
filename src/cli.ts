#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { answerAll } from "./answer.js";
import { CsvError, parseQuestions } from "./csv.js";
import { Index, parseDoc } from "./index.js";
import { answersCsv, reviewMarkdown } from "./report.js";

const USAGE = `questionnaire-copilot

  questionnaire-copilot answer <policies-dir> <questions.csv> [--csv out.csv] [--today YYYY-MM-DD] [--fail-on-manual]

Reads .md and .txt policies, drafts answers with citations. Offline: nothing is sent anywhere.
Exit codes: 0 ok, 1 questions needing an owner (with --fail-on-manual), 2 bad input.`;

function main(argv: string[]): number {
  const [cmd, dir, qf] = argv;
  if (cmd !== "answer" || !dir || !qf) { console.error(USAGE); return 2; }
  const o = (n: string) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
  const today = o("--today") ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) { console.error("--today must be YYYY-MM-DD"); return 2; }
  try {
    const docs = readdirSync(dir).filter((f) => /\.(md|txt)$/i.test(f)).sort().map((f) => ({ name: f, text: readFileSync(join(dir, f), "utf8") }));
    if (!docs.length) { console.error(`error: no .md or .txt files in ${dir}`); return 2; }
    const ix = new Index(docs.flatMap(parseDoc));
    const a = answerAll(ix, parseQuestions(readFileSync(qf, "utf8")), today);
    process.stdout.write(reviewMarkdown(a, today));
    const out = o("--csv"); if (out) writeFileSync(out, answersCsv(a));
    return argv.includes("--fail-on-manual") && a.some((x) => x.status === "manual") ? 1 : 0;
  } catch (e) {
    if (e instanceof CsvError || (e as NodeJS.ErrnoException).code === "ENOENT" || (e as NodeJS.ErrnoException).code === "ENOTDIR") { console.error(`error: ${(e as Error).message}`); return 2; }
    throw e;
  }
}

process.exitCode = main(process.argv.slice(2));
