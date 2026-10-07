# PSI08 Proof-Carrying Data Analyst

## Product scope

This is a **dataset-agnostic analytical AI agent**. The sales dataset in the repository is only a test fixture. The system is designed to accept user-provided data, infer its structure, answer analytical questions against the supplied evidence, and refuse unsupported or unverifiable claims.

### Current structured-data inputs

- CSV
- XLSX / XLS
- JSON
- JSONL

The upload layer assigns a safe internal filename and profiles the uploaded data before analysis.

### Planned document inputs

The architecture also supports a document-evidence path for PDFs, DOCX, reports, and other messy documents. Those sources should be parsed into searchable passages/tables before entering the same reasoning, evidence, verification, and proof pipeline.

## Component architecture

1. **Input Guard** — rejects unsafe or out-of-scope requests.
2. **Triage Agent** — Qwen3:8b classifies the request as answerable, ambiguous, or unsupported.
3. **Schema Resolver** — detects columns, types, missing values, uniqueness, samples, numeric fields, and date-like fields.
4. **State Manager** — retains the active dataset and query history for a session.
5. **Data Profiler** — checks row count, missing cells, duplicates, empty columns, and reliability flags.
6. **Evidence Retriever** — returns relevant source rows for a claim.
7. **Analysis Agent** — Qwen2.5-Coder generates executable Pandas analysis code.
8. **Tool Guard** — AST-validates generated code and blocks unsafe imports and operations.
9. **Sandbox Executor** — executes generated analysis in a restricted Python environment.
10. **Verifier Agent** — Qwen3:8b audits the analysis and result.
11. **Repair Agent** — Qwen2.5-Coder repairs failed code using execution or verification feedback, up to two retries.
12. **Decision Controller** — chooses answer, clarify, retry, or refuse.
13. **Output Guard** — checks final consistency before release.
14. **Trace Logger** — records the decision trail.
15. **Proof Packager** — bundles code, execution result, evidence, profile, verification, audit, and trace.

## Runtime flow

User data
→ format detection
→ data profiling
→ schema resolution
→ question triage
→ Qwen3 analysis plan
→ Qwen2.5-Coder proof code
→ tool guard
→ controlled execution
→ deterministic verification
→ Qwen3 verifier
→ evidence retrieval
→ output guard
→ proof package
→ user

Failures route through the Repair Agent for a maximum of two repair attempts.

## Core principle

**LLM reasons. Python computes. Verification proves.**

The system does not treat the LLM's numerical response as ground truth. Numerical claims must be derived from the supplied data, backed by executable analysis, and independently checked. When the available evidence is insufficient or the result cannot be verified, the agent refuses to answer.
