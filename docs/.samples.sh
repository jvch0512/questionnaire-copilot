node dist/src/cli.js answer examples/policies examples/questions.csv --today 2026-11-13 --csv /tmp/a.csv > /tmp/a.md; diff /tmp/a.md docs/sample-draft.md; diff /tmp/a.csv docs/sample-answers.csv
test "$(node dist/src/cli.js answer examples/policies examples/questions.csv --today 2026-11-13 --fail-on-manual >/dev/null; echo $?)" = "1"
