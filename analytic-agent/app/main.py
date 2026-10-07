# FastAPI entry point for the PSI08 Proof-Carrying Data Analyst
from pathlib import Path
import shutil
import uuid
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.analyzer import analyze_dataframe
from app.llm import ask_qwen3, ask_coder
from app.code_validator import validate_code
from app.executor import execute_code
from app.input_guard import validate_input
from app.triage import triage_question
from app.schema_resolver import resolve_schema
from app.data_profile import build_data_profile, reliability_gate
from app.evidence import extract_evidence
from app.verifier import profile_dataframe, verify_result
from app.repair_agent import repair_code
from app.decision import decide
from app.output_guard import guard_output
from app.trace_logger import TraceLogger
from app.proof_packager import build_proof_package
from app.state_manager import StateManager
from app.data_loader import load_tabular_file, validate_extension

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Proof-Carrying Data Analyst", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
state = StateManager()

class AnalyzeRequest(BaseModel):
    question: str
    dataset: str
    session_id: str = "default"

def resolve_dataset(dataset: str) -> Path:
    name = Path(dataset).name
    path = DATA_DIR / name
    upload_path = UPLOAD_DIR / name
    if path.exists():
        return path
    if upload_path.exists():
        return upload_path
    raise HTTPException(404, f"Dataset not found: {name}")

def load_dataset(dataset: str):
    path = resolve_dataset(dataset)
    try:
        return load_tabular_file(path)
    except ValueError as exc:
        raise HTTPException(400, str(exc))

@app.get("/")
def home():
    return {
        "status": "running",
        "agent": "Proof-Carrying Data Analyst",
        "planner_model": "qwen3:8b",
        "coder_model": "qwen2.5-coder:latest",
        "architecture_version": "0.4.0",
        "supported_tabular_formats": [".csv", ".xlsx", ".xls", ".json", ".jsonl"],
    }

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename or not validate_extension(file.filename):
        raise HTTPException(400, "Unsupported dataset format. Use CSV, XLSX, XLS, JSON, or JSONL.")
    safe_name = f"{uuid.uuid4().hex}_{Path(file.filename).name}"
    destination = UPLOAD_DIR / safe_name
    with destination.open("wb") as output:
        shutil.copyfileobj(file.file, output)
    try:
        df = load_tabular_file(destination)
        profile = build_data_profile(df)
        schema = resolve_schema(df)
    except Exception as exc:
        destination.unlink(missing_ok=True)
        raise HTTPException(400, f"Could not parse uploaded data: {exc}")
    return {
        "status": "uploaded",
        "dataset": f"uploads/{safe_name}",
        "original_filename": file.filename,
        "profile": profile,
        "schema": schema,
    }

@app.get("/api/profile")
def profile(dataset: str):
    return profile_dataframe(load_dataset(dataset))

@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    return state.get(session_id) or {"session_id": session_id, "queries": []}

@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    trace = TraceLogger()
    trace.add("input_guard", "started", {"dataset": request.dataset})
    input_check = validate_input(request.question)
    trace.add("input_guard", "passed" if input_check["allowed"] else "failed", input_check)
    if not input_check["allowed"]:
        return {"status":"refused","question":request.question,"reason":input_check["reason"],"evidence":{"input_guard":input_check,"trace":trace.export()}}

    state.start(request.session_id, request.dataset)
    df = load_dataset(request.dataset)

    triage = triage_question(request.question)
    trace.add("triage", triage["status"], triage)
    if triage["status"] == "refuse":
        result = {"status":"refused","question":request.question,"reason":triage["reason"],"evidence":{"triage":triage,"trace":trace.export()}}
        state.record(request.session_id, result)
        return result
    if triage["status"] == "ambiguous":
        result = {"status":"clarify","question":request.question,"reason":triage["reason"],"evidence":{"triage":triage,"trace":trace.export()}}
        state.record(request.session_id, result)
        return result

    data_profile = build_data_profile(df)
    gate = reliability_gate(data_profile)
    trace.add("data_profile", "completed", data_profile)
    trace.add("reliability_gate", "passed" if gate["reliable"] else "failed", gate)
    if not gate["reliable"]:
        result = {"status":"refused","question":request.question,"reason":gate["reason"],"evidence":{"triage":triage,"profile":data_profile,"reliability_gate":gate,"trace":trace.export()}}
        state.record(request.session_id, result)
        return result

    resolved_schema = resolve_schema(df)
    schema = "\n".join(
        f'- {item["name"]}: {item["dtype"]}; missing={item["missing"]}; unique={item["unique"]}; samples={item["sample"]}'
        for item in resolved_schema["columns"]
    )
    trace.add("schema_resolver", "completed", resolved_schema)

    try:
        plan = ask_qwen3(request.question, schema)
        trace.add("reasoning", "completed", plan)
        if plan["intent"] == "unknown" or not plan.get("needs_data", True):
            result = {"status":"refused","question":request.question,"reason":plan.get("reason","Question cannot be reliably answered from this dataset."),"evidence":{"triage":triage,"profile":data_profile,"schema":resolved_schema,"plan":plan,"trace":trace.export()}}
            state.record(request.session_id, result)
            return result

        expected_result = analyze_dataframe(df, plan)
        generated_code = ""
        executed_result = None
        safety = {"valid":False,"reason":"Code generation not attempted."}
        execution_error = None
        audit = None

        for attempt in range(3):
            trace.add("analysis_agent", "started", {"attempt": attempt + 1})
            if attempt == 0:
                generated_code = ask_coder(request.question, schema, plan)
            else:
                generated_code = repair_code(request.question, schema, plan, generated_code, execution_error or "Previous verification failed.")
            safety = validate_code(generated_code)
            trace.add("tool_guard", "passed" if safety["valid"] else "failed", safety)
            if not safety["valid"]:
                execution_error = safety["reason"]
                if attempt < 2:
                    continue
                return {"status":"refused","question":request.question,"reason":safety["reason"],"generated_code":generated_code,"evidence":{"profile":data_profile,"schema":resolved_schema,"plan":plan,"code_validation":safety,"trace":trace.export()}}

            try:
                executed_result = execute_code(generated_code, df)
                trace.add("sandbox_executor", "completed", {"result": executed_result})
            except Exception as exc:
                execution_error = str(exc)
                trace.add("sandbox_executor", "failed", {"error":execution_error})
                if attempt < 2:
                    continue
                return {"status":"refused","question":request.question,"reason":"Analysis code could not be executed after 3 attempts.","generated_code":generated_code,"evidence":{"profile":data_profile,"schema":resolved_schema,"plan":plan,"trace":trace.export()}}

            verification = verify_result(df, plan, expected_result)
            deterministic_match = executed_result == expected_result.get("value") or executed_result == expected_result
            verification["generated_code_match"] = bool(deterministic_match)
            if not deterministic_match:
                verification["verified"] = False
                verification["reason"] = "Executed code result does not match the independently computed result."
                execution_error = verification["reason"]
                if attempt < 2:
                    continue
                break

            # Deterministic audit: generated code must match the independently computed reference result.
            audit = {
                "verified": bool(verification["verified"]),
                "confidence": 0.99 if verification["verified"] else 0.0,
                "issues": [] if verification["verified"] else ["Result mismatch"],
                "reasoning": "Generated analysis was executed on the uploaded dataset and matched the independently computed reference result."
            }
            trace.add("verifier", "passed" if audit["verified"] else "failed", audit)
            if not verification["verified"]:
                execution_error = "Deterministic verification rejected the generated analysis."
                if attempt < 2:
                    continue
                break
            break

        if audit is None or not audit["verified"] or not verification["verified"]:
            return {"status":"refused","question":request.question,"reason":"The analysis could not be independently verified.","generated_code":generated_code,"executed_result":executed_result,"evidence":{"profile":data_profile,"schema":resolved_schema,"plan":plan,"verification":verification,"verifier_audit":audit,"trace":trace.export()}}
        
        evidence_rows = extract_evidence(df, plan, expected_result)
        output_guard = guard_output(executed_result, generated_code, verification, audit)
        trace.add("output_guard", "passed" if output_guard["safe"] else "failed", output_guard)
        if not output_guard["safe"]:
            return {"status":"refused","question":request.question,"reason":output_guard["reason"],"evidence":{"trace":trace.export()}}

        proof = build_proof_package(request.question, request.dataset, plan, generated_code, executed_result, evidence_rows, data_profile, verification, audit, trace.export())
        result = {
            "status":"verified",
            "question":request.question,
            "answer":expected_result["value"],
            "metric_value":expected_result.get("metric_value"),
            "operation":expected_result["operation"],
            "source":request.dataset,
            "confidence":min(0.99, float(audit["confidence"])),
            "generated_code":generated_code,
            "executed_result":executed_result,
            "evidence_rows":evidence_rows,
            "proof":proof,
        }
        state.record(request.session_id, result)
        return result

    except ValueError as exc:
        trace.add("pipeline", "failed", {"error":str(exc)})
        result = {"status":"refused","question":request.question,"reason":str(exc),"evidence":{"profile":data_profile,"schema":resolved_schema,"trace":trace.export()}}
        state.record(request.session_id, result)
        return result
    except Exception as exc:
        trace.add("pipeline", "error", {"error":str(exc)})
        raise HTTPException(500, str(exc))
