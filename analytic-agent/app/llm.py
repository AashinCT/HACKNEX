import json
import ollama
from app.prompts import QWEN3_PLANNER_SYSTEM, build_planner_prompt

QWEN3_MODEL = "qwen3:8b"
CODER_MODEL = "qwen2.5-coder:latest"

def ask_qwen3(question: str, schema: str) -> dict:
    response = ollama.chat(model=QWEN3_MODEL, messages=[{"role":"system","content":QWEN3_PLANNER_SYSTEM},{"role":"user","content":build_planner_prompt(question, schema)}], options={"temperature":0})
    content = response["message"]["content"].strip().replace("```json","").replace("```","").strip()
    try:
        plan = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError("Qwen3 returned invalid JSON") from exc
    required = {"intent","target_column","group_by","filter","sort","needs_data","reason"}
    missing = required - set(plan)
    if missing: raise ValueError(f"Planner response missing fields: {sorted(missing)}")
    return plan

def ask_coder(question: str, schema: str, plan: dict) -> str:
    system = "You are the code-generation engine of a Proof-Carrying Data Analyst. Generate ONLY Python code. Use pandas and a DataFrame named df. Calculate the requested result from df. Never invent data or columns. Do not access files or network. Do not use eval, exec, open, subprocess, os, requests, or shell commands. Store the final result in a variable named result."
    user = "QUESTION:\n" + question + "\n\nDATASET SCHEMA:\n" + schema + "\n\nTRUSTED ANALYSIS PLAN:\n" + json.dumps(plan, indent=2) + "\n\nReturn only executable Python code."
    response = ollama.chat(model=CODER_MODEL, messages=[{"role":"system","content":system},{"role":"user","content":user}], options={"temperature":0})
    return response["message"]["content"].strip().replace("```python","").replace("```","").strip()
