import json
import ollama

QWEN3_MODEL = "qwen3:8b"

def audit_result(question: str, plan: dict, generated_code: str, executed_result, expected_result: dict, profile: dict) -> dict:
    prompt = (
        "Audit this analytical result. Return ONLY valid JSON with verified, confidence, issues, reasoning.\n\n"
        "QUESTION:\n" + question + "\n\nPLAN:\n" + json.dumps(plan, indent=2) +
        "\n\nGENERATED CODE:\n" + generated_code +
        "\n\nEXECUTED RESULT:\n" + json.dumps(executed_result, default=str) +
        "\n\nREFERENCE RESULT:\n" + json.dumps(expected_result, default=str) +
        "\n\nDATA PROFILE:\n" + json.dumps(profile, indent=2)
    )
    response = ollama.chat(model=QWEN3_MODEL, messages=[
        {"role":"system","content":"You are a strict analytical auditor. Do not invent values."},
        {"role":"user","content":prompt},
    ], options={'temperature':0})
    content = response["message"]["content"].strip().replace("```json","").replace("```","").strip()
    try:
        audit = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError("Verifier Agent returned invalid JSON") from exc
    required = {"verified","confidence","issues","reasoning"}
    missing = required - set(audit)
    if missing:
        raise ValueError(f"Verifier response missing fields: {sorted(missing)}")
    return audit
