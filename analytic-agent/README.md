# Proof-Carrying Data Analyst

Analytical AI Agent for PSI08.

## Pipeline

User Question → Qwen3:8b → Analysis Plan → Qwen2.5-Coder → Executable Analysis → Pandas/DuckDB → Verification → Evidence-backed Answer or Refusal

The agent is designed so numerical answers are computed from the uploaded data rather than invented by the language model.
