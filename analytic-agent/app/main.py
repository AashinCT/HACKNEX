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
from app.evidence import extract_evidence
from app.verifier import profile_dataframe, verify_result
from app.verifier_agent import audit_result
from app.repair_agent import repair_code
from app.decision import decide
from app.output_guard import guard_output
from app.trace_logger import TraceLogger
from app.proof_packager import build_proof_package
from app.state_manager import StateManager

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

app = FastAPI(title="Proof-Carrying Data Analyst", version="0.3.0")
state = StateManager()

class AnalyzeRequest(BaseModel):
    question: str
    dataset: str = "sales.csv"
    session_id: str = "default"

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
        "architecture_version": "0.3.0",
    }

@app.get("/api/profile")
def profile(dataset: str = "sales.csv"):
    return profile_dataframe(load_dataset(dataset))

@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    return state.get(session_id) or {"session_id": session_id, "queries": []}

@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    trace = TraceLogger()
    trace.add("input_guard", "started", {"dataset": request.dataset})

    if not request.question.strip():
        return {"status": "refused", "reason": "Question is empty."}

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
    schema = "\n".join(f'- {item["name"]}: {item["dtype"]}' for item in resolved_schema["columns"])
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
                decision = decide(triage, gate, safety)
                result = {"status":"refused","question":request.question,"reason":decision["reason"],"generated_code":generated_code,"evidence":{"profile":data_profile,"schema":resolved_schema,"plan":plan,"code_validation":safety,"trace":trace.export()}}
                state.record(request.session_id, result)
                return result

            try:
                executed_result = execute_code(generated_code, df)
                trace.add("sandbox_executor", "completed", {"result": executed_result})
            except Exception as exc:
                execution_error = str(exc)
                trace.add("sandbox_executor", "failed", {"error":execution_error})
                if attempt < 2:
                    continue
                result = {"status":"refused","question":request.question,"reason":"Analysis code could not be executed after 3 attempts.","generated_code":generated_code,"evidence":{"profile":data_profile,"schema":resolved_schema,"plan":plan,"trace":trace.export()}}
                state.record(request.session_id, result)
                return result

            verification = verify_result(df, plan, expected_result)
            deterministic_match = executed_result == expected_result.get("value") or executed_result == expected_result
            verification["generated_code_match"] = bool(deterministic_match)
            if not deterministic_match:
                verification["verified"] = False
                verification["reason"] = "Executed code result does not match the independently computed result."
                execution_error = verification["reason"]
                trace.add("verification", "failed", verification)
                if attempt < 2:
                    continue
                break

            audit = audit_result(request.question, plan, generated_code, executed_result, expected_result, data_profile)
            trace.add("verifier_agent", "passed" if audit["verified"] else "failed", audit)

            if not verification["verified"] or not audit["verified"]:
                execution_error = "Verifier rejected the generated analysis."
                if attempt < 2:
                    continue
                break

            break

        if audit is None or not audit["verified"] or not verification["verified"]:
            decision = decide(triage, gate, safety, verification, audit or {"verified":False})
            return_result = {"status":"refused","question":request.question,"reason":decision["reason"],"generated_code":generated_code,"executed_result":executed_result,"evidence":{"profile":data_profile,"schema":resolved_schema,"plan":plan,"verification":verification,"verifier_audit":audit,"trace":trace.export()}}
            state.record(request.session_id, return_result)
            return return_result

        evidence_rows = extract_evidence(df, plan, expected_result)
        output_guard = guard_output(executed_result, generated_code, verification, audit)
        trace.add("output_guard", "passed" if output_guard["safe"] else "failed", output_guard)

        if not output_guard["safe"]:
            result = {"status":"refused","question":request.question,"reason":output_guard["reason"],"evidence":{"trace":trace.export()}}
            state.record(request.session_id, result)
            return result

        trace.add("proof_packager", "completed")
        proof = build_proof_package(
            request.question,
            request.dataset,
            plan,
            generated_code,
            executed_result,
            evidence_rows,
            data_profile,
            verification,
            audit,
            trace.export(),
        )

        result = {
            "status": "verified",
            "question": request.question,
            "answer": expected_result["value"],
            "metric_value": expected_result.get("metric_value"),
            "operation": expected_result["operation"],
            "source": request.dataset,
            "confidence": min(0.99, float(audit["confidence"])),
            "generated_code": generated_code,
            "executed_result": executed_result,
            "evidence_rows": evidence_rows,
            "proof": proof,
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
