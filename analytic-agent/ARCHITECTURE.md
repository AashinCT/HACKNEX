# PSI08 Analytics Agent Architecture

## Component architecture

1. Input Guard — Python rules reject unsafe or out-of-scope requests.
2. Triage Agent — Qwen3:8b classifies the request as answerable, ambiguous, or unsupported.
3. Schema Resolver — Python resolves columns, types, samples, numeric fields, and date-like fields.
4. State Manager — keeps session dataset and query history for the current backend process.
5. Data Profiler — detects missing values, duplicates, empty columns, and dataset size.
6. Evidence Retriever — returns relevant source rows for the analytical claim.
7. Analysis Agent — Qwen2.5-Coder generates Pandas proof code.
8. Tool Guard — AST-validates generated code and blocks unsafe operations.
9. Sandbox Executor — controlled Python execution with restricted builtins and no file/network tools.
10. Verifier Agent — Qwen3:8b audits the generated result and returns a verification decision.
11. Repair Agent — Qwen2.5-Coder repairs failed code using execution or verification feedback, up to two retries.
12. Decision Controller — chooses answer, clarify, retry, or refuse.
13. Output Guard — final consistency checks before an answer is released.
14. Trace Logger — records the complete decision trail.
15. Proof Packager — bundles code, result, evidence rows, profile, verification, audit, and trace.

## Execution flow

User → Input Guard → Triage → Schema Resolver → Data Profiler → Qwen3 Plan → Qwen2.5-Coder → Tool Guard → Sandbox Executor → Deterministic Verification → Qwen3 Verifier → Output Guard → Proof Package → User

Failures can route through the Repair Agent for a maximum of two repair attempts.

## Design principle

LLM reasons. Python computes. Verification proves.

Every numerical answer should be accompanied by executable analysis code, execution output, relevant evidence rows, data-quality information, and a verification trail. If evidence is insufficient or verification fails after repair attempts, the system refuses to answer.