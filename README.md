# Proof-Carrying Data Analyst

> **LLM reasons. Python computes. Verification proves.**

A proof-first, agentic data analysis system built for **HACKNEX 2026 – PSI08**.

Most LLM-based data assistants return an answer and ask the user to trust it. **Proof-Carrying Data Analyst** treats every analytical answer as a claim that must carry its own evidence.

The system takes a natural-language question over an uploaded dataset, creates a structured analysis plan, generates executable Python/Pandas code, runs that code against the actual dataset inside a controlled execution layer, independently verifies the result, extracts supporting evidence, and returns a structured proof package.

If the data cannot reliably answer the question, the system **refuses instead of inventing an answer**.

---

## 1. The Problem

LLMs are excellent at understanding natural language, but they are not reliable numerical calculators by themselves.

A conventional chatbot may answer:

> “Which region generated the highest revenue?”

with a plausible-looking value even when:

- the requested column does not exist,
- the question is ambiguous,
- the data is incomplete,
- the generated calculation is wrong,
- or the model simply makes an unsupported inference.

For analytical and business workflows, a confident but unverifiable number is dangerous.

The core problem is therefore not only:

**“Can an AI answer a data question?”**

It is:

**“Can an AI produce an answer that another system can independently verify?”**

---

# 2. Our Solution

Proof-Carrying Data Analyst changes the interaction from:

**Question → LLM → Answer**

to:

**Question → Plan → Code → Execution → Verification → Proof-Carrying Answer**

The LLM is not trusted to perform the final calculation in its own memory.

Instead:

1. The LLM understands the user's intent.
2. It creates a structured analysis plan.
3. A code-generation model converts the plan into executable Python/Pandas.
4. The code is validated before execution.
5. The code executes against the actual uploaded dataset.
6. A deterministic reference calculation independently reproduces the expected result.
7. The system compares the generated execution with the reference result.
8. Evidence rows, data quality information, generated code, and execution trace are packaged as proof.
9. Only a verified result is returned.
10. If the question cannot be supported by the dataset, the system refuses.

This makes the LLM an **analytical planner/compiler**, rather than the final source of truth.

---

# 3. Why This Is Different From ChatGPT

A user can already ask ChatGPT to write Python code for a CSV.

That is not the core innovation.

The difference is the **closed-loop verification pipeline** around the model.

| Conventional LLM Chat | Proof-Carrying Data Analyst |
|---|---|
| Generates a response | Generates an analysis plan |
| May calculate in natural language | Generates executable code |
| User must trust the answer | Code is executed on the actual data |
| No mandatory proof contract | Every verified result carries proof |
| May try to answer unsupported questions | Reliability gate can refuse |
| Evidence is optional | Evidence is part of the result |
| Human manually checks the work | Automated verification reproduces the result |
| General-purpose assistant | Deterministic analytical pipeline |

The design goal is simple:

> **The model can propose the computation. The system decides whether the computation is trustworthy.**

---

# 4. MVP Architecture

```text
┌─────────────────────────────┐
│        User Question        │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│        Input Guard          │
│  Validate question/dataset  │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│          Triage             │
│ Is the question answerable? │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│        Data Profile         │
│ Schema / missing / duplicate │
│ / reliability information   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│      Reliability Gate       │
│ Can the data support this?  │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│          Qwen3              │
│  Natural Language → Plan    │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│       Schema Resolver       │
│ Match intent to real fields │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│     Qwen2.5-Coder           │
│    Plan → Python/Pandas     │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│       Code Validator        │
│ Validate generated code     │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│      Sandbox Executor       │
│ Execute on actual dataset   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Independent Verification    │
│ Reproduce expected result   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│       Evidence Layer        │
│ Rows + profile + trace      │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│        Output Guard         │
│ Only release supported data │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│       Proof Package         │
│ Answer + code + evidence    │
│ + verification + trace      │
└─────────────────────────────┘
```

---

# 5. The Agentic Loop

The MVP is a **tool-using autonomous data analysis agent**.

It does not stop after generating text.

```text
Understand
    ↓
Plan
    ↓
Generate Code
    ↓
Validate
    ↓
Execute
    ↓
Verify
    ↓
Collect Evidence
    ↓
Decide
    ↓
Answer OR Refuse
```

This closed loop is the heart of the system.

---

# 6. How the MVP Works

## Step 1 — Dataset Upload

The user uploads a dataset through the React frontend.

The system profiles the data before attempting analysis.

The profile includes information such as:

- number of rows
- number of columns
- column names
- missing cells
- missing values by column
- duplicate rows
- empty columns
- reliability flags

This gives the agent a machine-readable view of the actual dataset.

---

## Step 2 — User Question

Example:

> **Which region generated the highest revenue?**

The question is sent to the FastAPI backend.

---

## Step 3 — Triage and Reliability Gate

Before generating an answer, the system checks whether the question can be supported by the dataset.

For example:

Dataset:

```text
date
region
product
quantity
revenue
```

Question:

> What was the profit generated by each region?

The system detects that:

```text
profit ∉ dataset schema
```

Therefore it refuses.

### Example refusal

> **Cannot answer reliably**

Reason:

> The dataset contains `revenue` but no `profit` column.

The UI also displays the available columns.

Most importantly:

> **No estimate or unsupported value is generated.**

This refusal behavior is a first-class feature, not an error state.

---

# 7. Question → Structured Analysis Plan

For an answerable question such as:

> Which region generated the highest revenue?

Qwen3 produces a structured plan similar to:

```json
{
  "intent": "groupby_sum",
  "target_column": "revenue",
  "group_by": "region",
  "filter": null,
  "sort": null,
  "needs_data": true
}
```

The semantic distinction matters.

For example:

- **highest total revenue by region** → `groupby_sum`
- **highest individual transaction** → `groupby_maximum`

The system therefore separates **language interpretation** from **actual computation**.

---

# 8. Plan → Executable Code

Qwen2.5-Coder converts the structured plan into Python/Pandas.

Example:

```python
result = df.groupby('region')['revenue'].sum().idxmax()
```

The generated code is retained as part of the proof package.

The code is not merely explanatory text.

It is the actual computational artifact used to produce the result.

---

# 9. Code Validation

Generated code passes through a validation layer before execution.

The objective is to prevent arbitrary or unsafe generated code from being blindly executed.

The validator checks the generated Python structure before it reaches the execution layer.

---

# 10. Execution on the Actual Dataset

The validated code runs against the uploaded dataset.

For the example dataset:

```text
North → ₹620,000
South → ₹1,350,000
West  → ₹860,000
```

Therefore:

```text
Answer: South
Metric: ₹1,350,000
```

The calculation is performed by Python/Pandas against the dataset, rather than being guessed by the LLM.

---

# 11. Independent Verification

This is one of the most important parts of the architecture.

The system independently computes the expected result using a deterministic reference path.

Then:

```text
Generated Code Result
        │
        │ compare
        ↓
Independent Reference Result
```

Only when the results agree does the system mark the analysis as verified.

Example:

```json
{
  "verified": true,
  "generated_code_match": true
}
```

The current MVP assigns a high confidence value when this deterministic verification succeeds.

---

# 12. Proof-Carrying Output

A successful analysis does not return only:

```text
South
```

It returns a proof package containing:

- final answer
- metric value
- operation
- generated Python code
- executed result
- evidence rows
- data profile
- analysis plan
- verification result
- verifier audit
- execution trace
- confidence

Conceptually:

```text
┌──────────────────────────────┐
│          CLAIM               │
│ South generated the highest  │
│ total revenue.               │
├──────────────────────────────┤
│          PROOF               │
│                              │
│ Analysis Plan                │
│ Generated Python             │
│ Execution Result             │
│ Evidence Rows                │
│ Data Profile                 │
│ Verification                 │
│ Audit                        │
│ Trace                        │
└──────────────────────────────┘
```

This is the central idea behind **Proof-Carrying Data Analysis**.

---

# 13. Evidence

The system extracts supporting rows from the dataset and exposes them through the UI.

This allows a reviewer to move from:

**Answer**

to:

**Evidence**

to:

**Code**

to:

**Verification**

without trusting the model blindly.

---

# 14. Execution Trace

The backend records the major stages of the analysis.

Example:

```text
input_guard
      ↓
triage
      ↓
data_profile
      ↓
reliability_gate
      ↓
schema_resolver
      ↓
reasoning
      ↓
analysis_agent
      ↓
tool_guard
      ↓
sandbox_executor
      ↓
verifier
      ↓
output_guard
```

This gives the user and evaluator visibility into how the result was produced.

---

# 15. Example: Verified Analysis

### Question

> Which region generated the highest revenue?

### Dataset

```text
date,region,product,quantity,revenue
...
```

### Result

```text
Answer: South
Metric: ₹1,350,000
Status: VERIFIED
Confidence: 99%
```

### Generated computation

```python
df.groupby('region')['revenue'].sum().idxmax()
```

### Verification

```text
Generated result: South
Reference result: South
Match: TRUE
```

The UI then exposes the evidence, code, analysis plan, data quality and execution trace.

---

# 16. Example: Refusal

### Question

> What was the profit generated by each region?

### Available schema

```text
date
region
product
quantity
revenue
```

### Result

```text
Status: CANNOT ANSWER RELIABLY

Reason:
The dataset contains 'revenue' but no 'profit' column.

No estimate or unsupported value was generated.
```

This demonstrates an important property:

> **When evidence is absent, the system prefers refusal over hallucination.**

---

# 17. Supported Analytical Operations in the MVP

The current deterministic analysis layer supports:

- `count_rows`
- `sum`
- `average`
- `minimum`
- `maximum`
- `groupby_sum`
- `groupby_average`
- `groupby_minimum`
- `groupby_maximum`

The system is schema-aware, so the same pipeline can operate on datasets with different column names and domains when the requested operation is supported.

---

# 18. Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Browser-based analysis dashboard

### Backend

- Python
- FastAPI
- Pandas
- Uvicorn

### Local AI

- **Qwen3:8b** — question understanding and structured analysis planning
- **Qwen2.5-Coder** — executable Python/Pandas code generation
- Ollama — local model runtime

### Verification & Reliability

- deterministic reference calculations
- schema resolution
- data profiling
- reliability gate
- AST/code validation
- controlled execution
- evidence extraction
- output guard
- proof packaging
- execution trace

---

# 19. Repository Structure

```text
HACKNEX/
│
├── analytic-agent/
│   ├── app/
│   │   ├── main.py
│   │   ├── llm.py
│   │   ├── analyzer.py
│   │   ├── verifier.py
│   │   ├── prompts.py
│   │   ├── code_validator.py
│   │   ├── executor.py
│   │   ├── triage.py
│   │   ├── schema_resolver.py
│   │   ├── data_profile.py
│   │   ├── evidence.py
│   │   ├── verifier_agent.py
│   │   ├── repair_agent.py
│   │   ├── decision.py
│   │   ├── output_guard.py
│   │   ├── trace_logger.py
│   │   ├── proof_packager.py
│   │   ├── state_manager.py
│   │   ├── input_guard.py
│   │   └── data_loader.py
│   │
│   ├── data/
│   │   ├── sales.csv
│   │   └── uploads/
│   │
│   ├── requirements.txt
│   ├── README.md
│   └── ARCHITECTURE.md
│
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
└── package.json
```

---

# 20. Local Setup

## Prerequisites

Install:

- Python 3.x
- Node.js
- npm
- Ollama

Pull the required models:

```bash
ollama pull qwen3:8b
ollama pull qwen2.5-coder:latest
```

Verify:

```bash
ollama list
```

---

## Start the Backend

```powershell
cd "C:\Users\Aashin C\HACKNEX\analytic-agent"
```

Create/activate the Python environment if required:

```powershell
python -m venv venv
.\venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Start FastAPI:

```powershell
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Start the Frontend

Open another terminal:

```powershell
cd "C:\Users\Aashin C\HACKNEX"
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

---

# 21. API Flow

### Upload

```text
POST /api/upload
```

Uploads and profiles a dataset.

### Analyze

```text
POST /api/analyze
```

Example request:

```json
{
  "question": "Which region generated the highest revenue?",
  "dataset": "uploads/sales.csv",
  "session_id": "demo1"
}
```

The response contains the answer plus the proof package.

---

# 22. Proof Package Structure

A verified response is structured around the following concepts:

```json
{
  "status": "verified",
  "answer": "South",
  "metric_value": 1350000,
  "operation": "groupby_sum",
  "generated_code": "...",
  "executed_result": "South",
  "evidence_rows": {},
  "proof": {
    "analysis_plan": {},
    "proof_code": "...",
    "execution_result": "South",
    "evidence_rows": {},
    "data_profile": {},
    "verification": {},
    "verifier_audit": {},
    "trace": {}
  }
}
```

The exact payload can evolve as the MVP develops, but the principle remains:

> **A numerical claim should be accompanied by a reproducible computational artifact and verification evidence.**

---

# 23. Security and Reliability Philosophy

The system is intentionally designed so that generated code is not automatically treated as trusted.

The pipeline includes:

```text
Natural Language
      ↓
Generated Code
      ↓
Code Validation
      ↓
Controlled Execution
      ↓
Independent Verification
      ↓
Output Guard
```

This is important because the code itself is generated by an LLM.

The architecture therefore separates:

**generation** from **execution** and **verification**.

---

# 24. Real-World Applications

The concept extends beyond a demo sales dataset.

### FinTech / Auditing

An auditor could ask:

> What was the exact net deductible expense in Europe for Q3 after removing duplicate vendor entries?

The system can eventually produce the computation and proof trail required for review.

### Business Intelligence

> Which product category produced the highest total margin?

The system can compute the result from the uploaded business data and expose the calculation.

### Operations

> Which warehouse had the highest average delivery delay?

The result can be accompanied by the underlying evidence and executable computation.

### Compliance

> How many transactions violated the configured threshold?

Instead of returning an unsupported number, the system can provide the exact computation used to derive the result.

---

# 25. Why the Architecture Matters

The key design principle is:

> **Do not make the LLM the calculator. Make the LLM the planner.**

The LLM is good at:

- understanding natural language
- mapping intent to schema
- planning an analysis
- generating code
- explaining results

Deterministic software is better suited for:

- arithmetic
- aggregation
- filtering
- execution
- verification
- validation
- enforcing refusal rules

Combining these strengths creates a more trustworthy analytical agent.

---

# 26. Hackathon Innovation

The innovation is not another chatbot over CSV files.

It is the **proof contract**.

For every supported analytical answer, the system attempts to provide:

```text
CLAIM
+
CODE
+
EXECUTION
+
EVIDENCE
+
VERIFICATION
+
TRACE
```

The system therefore moves from:

**“Trust the AI.”**

to:

**“Run the proof.”**

---

# 27. Evaluation / Demo Strategy

A strong demonstration should show both success and failure.

### Demo A — Correct analytical reasoning

Ask:

> Which region generated the highest revenue?

Show:

- Answer
- Metric
- Generated Python
- Evidence
- Verification
- Confidence
- Execution trace

### Demo B — Unsupported question

Ask:

> What was the profit generated by each region?

Show:

- refusal
- missing `profit` field
- available columns
- no unsupported estimate

### Demo C — Another valid numerical query

Ask:

> What is the total revenue?

Expected:

```text
₹2,830,000
```

The combination demonstrates both:

**analytical capability + refusal discipline**

rather than only a successful happy path.

---

# 28. Current MVP Scope

The current MVP focuses on structured tabular data and a controlled set of analytical operations.

It demonstrates the complete proof-carrying loop:

```text
Upload
→ Understand
→ Plan
→ Generate
→ Validate
→ Execute
→ Verify
→ Explain
→ Prove
```

It is not intended to claim that every possible data-science operation, arbitrary document format, or every form of messy data is already solved.

The architecture is designed to be extended with additional analytical operators, richer cleaning operations, document/table extraction, stronger sandbox isolation, persistent sessions, and broader verification strategies.

---

# 29. Future Roadmap

### Phase 1 — MVP
- [x] Natural-language data questions
- [x] Dataset upload
- [x] Schema profiling
- [x] Reliability/refusal gate
- [x] Qwen3 planning
- [x] Qwen2.5-Coder code generation
- [x] Code validation
- [x] Controlled execution
- [x] Deterministic verification
- [x] Evidence extraction
- [x] Proof package
- [x] Execution trace
- [x] React dashboard

### Phase 2
- [ ] More analytical operators
- [ ] Advanced data cleaning
- [ ] Better handling of messy schemas
- [ ] Statistical analysis
- [ ] Time-series analysis
- [ ] Stronger sandbox isolation
- [ ] Persistent analysis history

### Phase 3
- [ ] Multi-table reasoning
- [ ] Document/table extraction
- [ ] SQL/DuckDB execution
- [ ] Human-in-the-loop review
- [ ] Cryptographically signed proof receipts
- [ ] Enterprise audit integrations

---

# 30. External Models and Open-Source Components

This project does not train a new foundation model from scratch.

It uses open/local model infrastructure as components inside a controlled analytical pipeline.

### Models

- Qwen3:8b
- Qwen2.5-Coder

### Runtime

- Ollama

### Data / computation

- Python
- Pandas

### API

- FastAPI
- Uvicorn

### Frontend

- React
- Vite

The important contribution is the **application and verification architecture around these components**, not claiming ownership of the underlying foundation models.

---

# 31. The Core Idea in One Sentence

> **Proof-Carrying Data Analyst is an agentic data-analysis system where an LLM plans the computation, Python performs it on the real dataset, an independent verifier reproduces it, and the final answer carries its own executable proof—or the system refuses to answer.**

---

# 32. The Judge's Question: “Why Not Just Use ChatGPT?”

### Our answer:

> **“ChatGPT is a general-purpose conversational interface. Our system is a deterministic verification pipeline. We use an LLM as a planner and code generator, but the actual result is produced by executable code on the user's data, independently verified, backed by evidence, and packaged as a structured proof receipt. If the data cannot support the question, our system refuses instead of guessing.”**

---

## License

This project was developed as a hackathon prototype for **HACKNEX 2026 – PSI08**.
