export class CsvError extends Error {}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cur = "", q = false;
  const t = text.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const c = t[i]!;
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === "," || c === ";") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(cur); cur = ""; if (row.some((x) => x.trim())) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur); if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

export const toCsv = (rows: string[][]): string => rows.map((r) => r.map((c) => (/[",;\n\r]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n") + "\n";

export function parseQuestions(text: string): { id: string; text: string; category: string }[] {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new CsvError("questionnaire needs a header row and at least one question");
  const h = rows[0]!.map((x) => x.trim().toLowerCase());
  const qi = h.findIndex((x) => ["question", "pregunta", "text", "texto"].includes(x));
  if (qi < 0) throw new CsvError('questionnaire needs a "question" (or "pregunta") column');
  const ii = h.findIndex((x) => ["id", "ref", "n", "#"].includes(x)), ci = h.findIndex((x) => ["category", "categoria", "section", "seccion"].includes(x));
  return rows.slice(1).filter((r) => (r[qi] ?? "").trim()).map((r, i) => ({ id: ii >= 0 && r[ii]?.trim() ? r[ii]!.trim() : String(i + 1), text: r[qi]!.trim(), category: ci >= 0 ? (r[ci] ?? "").trim() : "" }));
}
