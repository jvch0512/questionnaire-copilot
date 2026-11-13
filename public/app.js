import { answerAll } from "/lib/answer.js";
import { parseQuestions } from "/lib/csv.js";
import { Index, parseDoc } from "/lib/index.js";
import { answersCsv, reviewMarkdown } from "/lib/report.js";

const $ = (id) => document.getElementById(id);
function el(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
function table(headers, rows, classes = []) {
  const t = document.createElement("table");
  const h = document.createElement("tr");
  headers.forEach((x) => h.append(el("th", x)));
  t.append(h);
  rows.forEach((r) => { const tr = document.createElement("tr"); r.forEach((c, i) => tr.append(el("td", String(c), classes[i] ? classes[i](c) : undefined))); t.append(tr); });
  return t;
}
function cards(items) {
  const box = el("div", undefined, "cards");
  for (const [label, value, cls] of items) { const c = el("div", undefined, `card ${cls ?? ""}`); c.append(el("b", String(value)), el("span", label)); box.append(c); }
  return box;
}
function panel(title, ...kids) { const p = el("div", undefined, "panel"); p.append(el("h2", title), ...kids); return p; }
function copyButton(getMd) {
  const b = el("button", "Copy markdown");
  b.type = "button";
  b.addEventListener("click", async () => { try { await navigator.clipboard.writeText(getMd()); b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy markdown"; }, 1500); } catch { /* clipboard blocked */ } });
  return b;
}
function downloadButton(getMd, name) {
  const b = el("button", "Download .md");
  b.type = "button";
  b.addEventListener("click", () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([getMd()], { type: "text/markdown" })); a.download = name; a.click(); URL.revokeObjectURL(a.href); });
  return b;
}
async function sample(name) { return (await fetch(`/examples/${name}`)).text(); }
function showError(box, e) { box.replaceChildren(el("p", String(e.message ?? e), "err")); }
function setupTabs() {
  document.querySelectorAll("#tabs button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("on", x === b));
    document.querySelectorAll(".tab").forEach((s) => { s.hidden = s.id !== `p-${b.dataset.tab}`; });
  }));
}
const cls = (map) => (v) => map[v] ?? "";


function splitDocs(t) {
  const out = [];
  const re = /^===\s*(.+?)\s*===\s*$/gm;
  const marks = [...t.matchAll(re)];
  if (!marks.length) return [{ name: "policy.md", text: t }];
  marks.forEach((m, i) => out.push({ name: m[1], text: t.slice(m.index + m[0].length, i + 1 < marks.length ? marks[i + 1].index : undefined).trim() }));
  return out;
}

function run() {
  const out = $("out");
  out.replaceChildren();
  if (!$("policies").value.trim() || !$("questions").value.trim()) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const ix = new Index(splitDocs($("policies").value).flatMap(parseDoc));
    const a = answerAll(ix, parseQuestions($("questions").value), today);
    const n = (s) => a.filter((x) => x.status === s).length;
    out.append(cards([["Ready", n("auto"), "ok"], ["Review", n("review"), n("review") ? "warn" : "ok"], ["Need an owner", n("manual"), n("manual") ? "bad" : "ok"], ["Questions", a.length]]));
    out.append(panel("Draft answers", table(["#", "Question", "Answer", "Conf.", "Status", "Source", "Flags"], a.map((x) => [x.q.id, x.q.text, x.answer, x.confidence, x.status, x.source || "-", x.flags.join(", ") || "-"]), [null, null, null, null, cls({ auto: "s-low", review: "s-medium", manual: "s-high" })])));
    const ev = a.filter((x) => x.quote);
    if (ev.length) out.append(panel("Evidence behind each answer", ...ev.map((x) => el("p", `${x.q.id}: "${x.quote}" (${x.source})`))));
    const row = el("div", undefined, "row");
    row.append(copyButton(() => reviewMarkdown(a, today)), downloadButton(() => reviewMarkdown(a, today), "questionnaire-draft.md"), downloadButton(() => answersCsv(a), "questionnaire-answers.csv"));
    out.append(row);
  } catch (e) { showError(out, e); }
}

$("sample").addEventListener("click", async () => { [$("policies").value, $("questions").value] = await Promise.all([sample("policies.txt"), sample("questions.csv")]); run(); });
for (const id of ["policies", "questions"]) $(id).addEventListener("input", run);
