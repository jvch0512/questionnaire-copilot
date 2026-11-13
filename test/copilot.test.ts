import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { answerAll, isYesNo, polarityOf } from "../src/answer.js";
import { parseCsv, parseQuestions, toCsv, CsvError } from "../src/csv.js";
import { Index, parseDoc } from "../src/index.js";
import { answersCsv, reviewMarkdown } from "../src/report.js";
import { fold, stem, tokens } from "../src/text.js";

const docs = readdirSync("examples/policies").map((f) => ({ name: f, text: readFileSync(`examples/policies/${f}`, "utf8") }));
const ix = () => new Index(docs.flatMap(parseDoc));
const answers = () => answerAll(ix(), parseQuestions(readFileSync("examples/questions.csv", "utf8")), "2026-11-13");
const get = (id: string) => answers().find((a) => a.q.id === id)!;

test("fold removes accents; stem trims suffixes", () => {
  assert.equal(fold("Protección"), "proteccion");
  assert.equal(stem("encrypted"), stem("encrypt"));
  assert.equal(stem("enforced"), stem("enforce"));
});

test("English and Spanish phrasings share concept tokens", () => {
  assert.ok(tokens("multi-factor authentication").includes("c_mfa"));
  assert.ok(tokens("autenticación multifactor").includes("c_mfa"));
  assert.ok(tokens("delegado de protección de datos").includes("c_privacy"));
  assert.ok(tokens("cifrado en reposo").includes("c_encryption"));
});

test("front matter and headings are parsed", () => {
  const c = parseDoc(docs.find((d) => d.name === "information-security.md")!);
  assert.equal(c[0]!.title, "Information Security Policy");
  assert.equal(c[0]!.reviewed, "2026-06-15");
  assert.ok(c.some((x) => x.heading === "Encryption"));
});

test("BM25 ranks the right section first", () => {
  assert.equal(ix().search("encryption at rest AES")[0]!.chunk.heading, "Encryption");
  assert.equal(ix().search("backup restore tests")[0]!.chunk.heading, "Backups");
});

test("yes/no detection and polarity", () => {
  assert.ok(isYesNo("Do you encrypt data?")); assert.ok(isYesNo("¿Dispone de un DPO?")); assert.ok(!isYesNo("How quickly do you notify customers?"));
  assert.equal(polarityOf("We do not currently run red team exercises."), "no");
  assert.equal(polarityOf("A 24x7 SOC is planned for 2027 and is not yet in place."), "no");
  assert.equal(polarityOf("ISO 27001 certification is planned for 2027."), "partial");
  assert.equal(polarityOf("Data is encrypted at rest."), "yes");
});

test("clear evidence is answered automatically with a citation", () => {
  const a = get("Q2"); assert.equal(a.answer, "Yes"); assert.equal(a.status, "auto"); assert.match(a.source, /Encryption/); assert.match(a.quote, /AES-256/);
});

test("explicit negative evidence gives No", () => {
  const a = get("Q4"); assert.equal(a.answer, "No"); assert.equal(a.status, "auto");
});

test("planned controls are never presented as yes", () => {
  assert.equal(get("Q5").answer, "No"); assert.notEqual(get("Q5").status, "auto");
  assert.equal(get("Q9").answer, "Partial"); assert.ok(get("Q9").flags.includes("planned-not-done"));
});

test("answers work across languages (Spanish policy, English question)", () => {
  assert.match(get("Q10").answer, /90 días/);
  assert.equal(get("Q14").answer, "Yes");
});

test("stale source is flagged and sent to review", () => {
  const a = get("Q6"); assert.ok(a.flags.includes("stale-source")); assert.equal(a.status, "review");
});

test("uncovered questions need an owner", () => {
  for (const id of ["Q11", "Q12"]) { const a = get(id); assert.equal(a.status, "manual"); assert.match(a.answer, /Needs an owner/); }
});

test("CSV round trip and validation", () => {
  assert.deepEqual(parseCsv('a,b\n"x, y","say ""hi"""\n'), [["a", "b"], ["x, y", 'say "hi"']]);
  assert.equal(toCsv([["a", 'b"c', "d,e"]]), 'a,"b""c","d,e"\n');
  assert.throws(() => parseQuestions("id,foo\n1,x"), CsvError);
  assert.throws(() => parseQuestions("question"), CsvError);
  assert.equal(parseQuestions("pregunta\n¿Cifra los datos?")[0]!.id, "1");
});

test("reports", () => {
  const a = answers();
  assert.match(reviewMarkdown(a, "2026-11-13"), /14 questions: \d+ ready to send/);
  assert.equal(parseCsv(answersCsv(a)).length, 15);
});
