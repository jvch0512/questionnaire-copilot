# questionnaire-copilot

Answer customer security questionnaires from your own policies. It retrieves the relevant passage with BM25, decides yes, no or partial, cites the sentence it relied on, and flags what a human must check: stale documents, controls that are planned but not done, conflicting passages and questions your documents do not cover. English and Spanish, including across languages. No model is called and nothing leaves your machine. Zero runtime dependencies. CLI and browser tool.

Live demo: https://jvch0512.github.io/questionnaire-copilot/ (runs in the tab, nothing is uploaded)

## Why

Pre-sales and security teams answer the same questionnaire hundreds of times, and the expensive part is not typing, it is not overclaiming. A planned SOC is not a SOC, a restore test from two years ago is not an annual test. questionnaire-copilot is built around that: every answer carries its evidence, and "we plan to" never becomes "yes".

## Quick start

```bash
npm install
npm test
node dist/src/cli.js answer examples/policies examples/questions.csv --csv answers.csv
node dist/src/cli.js answer policies/ questions.csv --fail-on-manual   # CI gate, exit 1 if any question has no evidence
npm start   # UI on http://127.0.0.1:8787
```

Policies are `.md` or `.txt` files, split by headings and paragraphs. Optional front matter:

```
---
title: Information Security Policy
reviewed: 2026-06-15
---
```

The questionnaire is a CSV with an `id` and a `question` (or `pregunta`) column and an optional `category`.

## How it decides

1. Tokenise with accent folding, stop words and a light stemmer for English and Spanish, and map synonyms to shared concept tokens (for example "multi-factor", "2FA" and "autenticación multifactor" all become one token), so a Spanish policy answers an English question.
2. Rank passages with BM25 and pick the best sentence by idf-weighted coverage of the question terms.
3. For yes/no questions, read the sentence: negation gives No, "planned", "in progress" or "roadmap" gives No or Partial, otherwise Yes.
4. Confidence combines sentence coverage, the retrieval score and a concept match. Above 0.6 a question is ready, from 0.45 it is reviewed, below it needs an owner.
5. Flags: `stale-source` (document reviewed more than 12 months ago), `undated-source`, `planned-not-done`, `conflict` (strong passages disagree), `low-confidence`, `no-evidence`.

## Limits

Retrieval and polarity are lexical, not semantic: unusual phrasing or a double negative can fool them, which is why every answer shows its evidence and low confidence goes to a person. It answers from what your documents say, not from what your systems do. Review everything before you send it; an answer the evidence does not support is a misstatement.

## License

MIT
