# FastAPI entry point for the PSI08 Proof-Carrying Data Analyst
from pathlib import Path
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.analyzer import analyze_dataframe
from app.llm import ask_qwen3, ask_coder
from app.code_validator import validate_code
from app.executor import execute_code
from app.triage import triage_question
from app.schema_resolver import resolve_schema
from app.data_profile import build_data_profile, reliability_gate
from app.verifier import profile_dataframe, verify_result

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
app = FastAPI(title="Proof-Carrying Data Analyst", version="0.2.0")

class AnalyzeRequest(BaseModel):
    question: str
    dataset: str = "sales.csv"

def load_dataset(dataset: str):
    path = DATA_DIR / dataset
    if path.suffix.lower() != ".csv":
        raise HTTPException(400, "MVP currently supports CSV datasets only.")
    if not path.exists():
        raise HTTPException(404, f"Dataset not found: {dataset}")
    return pd.read_csv(path)

@app.get("/")
def home():
    return {
        "status": "running",
        "agent": "Proof-Carrying Data Analyst",
        "planner_model": "qwen3:8b",
        "coder_model": "qwen2.5-coder:7b",
    }

@app.get("/api/profile")
def profile(dataset: str = "sales.csv"):
    return profile_dataframe(load_dataset(dataset))

@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    df = load_dataset(request.dataset)

    triage = triage_question(request.question)
    if triage["status"] == "refuse":
        return {
            "status": "refused",
            "question": request.question,
            "reason": triage["reason"],
            "evidence": {"triage": triage},
        }
    if triage["status"] == "ambiguous":
        return {
            "status": "clarify",
            "question": request.question,
            "reason": triage["reason"],
            "evidence": {"triage": triage},
        }

    data_profile = build_data_profile(df)
    gate = reliability_gate(data_profile)
    if not gate["reliable"]:
        return {
            "status": "refused",
            "question": request.question,
            "reason": gate["reason"],
            "evidence": {
                "triage": triage,
                "profile": data_profile,
                "reliability_gate": gate,
            },
        }

    resolved_schema = resolve_schema(df)
    schema = "\n".join(
        f'- {item["name"]}: {item["dtype"]}'
        for item in resolved_schema["columns"]
    )

    try:
        plan = ask_qwen3(request.question, schema)

        if plan["intent"] == "unknown":
            return {
                "status": "refused",
                "question": request.question,
                "reason": plan["reason"],
                "evidence": {
                    "triage": triage,
                    "profile": data_profile,
                    "schema": resolved_schema,
                    "plan": plan,
                },
            }

        generated_code = ask_coder(request.question, schema, plan)
        safety = validate_code(generated_code)

        if not safety["valid"]:
            return {
                "status": "refused",
                "question": request.question,
                "reason": safety["reason"],
                "generated_code": generated_code,
                "evidence": {
                    "triage": triage,
                    "profile": data_profile,
                    "schema": resolved_schema,
                    "plan": plan,
                    "code_validation": safety,
                },
            }

        executed_result = execute_code(generated_code, df)
        expected_result = analyze_dataframe(df, plan)

        verification = verify_result(df, plan, expected_result)

        if not verification["verified"]:
            return {
                "status": "refused",
                "question": request.question,
                "reason": "Independent verification failed.",
                "evidence": {
                    "triage": triage,
                    "profile": data_profile,
                    "schema": resolved_schema,
                    "generated_code": generated_code,
                    "executed_result": executed_result,
                    "verification": verification,
                },
            }

        return {
            "status": "verified",
            "question": request.question,
            "answer": expected_result["value"],
            "metric_value": expected_result.get("metric_value"),
            "operation": expected_result["operation"],
            "source": request.dataset,
            "confidence": 0.98,
            "plan": plan,
            "generated_code": generated_code,
            "executed_result": executed_result,
            "evidence": {
                "triage": triage,
                "profile": data_profile,
                "schema": resolved_schema,
                "reliability_gate": gate,
                "verification": verification,
                "code_validation": safety,
            },
        }

    except ValueError as exc:
        return {
            "status": "refused",
            "question": request.question,
            "reason": str(exc),
            "evidence": {
                "triage": triage,
                "profile": data_profile,
                "schema": resolved_schema,
            },
        }
    except Exception as exc:
        raise HTTPException(500, str(exc))
