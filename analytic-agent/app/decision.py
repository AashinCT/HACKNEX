def decide(triage, gate, code_validation=None, verification=None, audit=None):
    if triage.get("status") == "refuse": return {"action":"refuse","reason":triage.get("reason","Input rejected.")}
    if triage.get("status") == "ambiguous": return {"action":"clarify","reason":triage.get("reason","Clarification required.")}
    if not gate.get("reliable", False): return {"action":"refuse","reason":gate.get("reason","Dataset is unreliable.")}
    if code_validation is not None and not code_validation.get("valid", False): return {"action":"retry","reason":code_validation.get("reason","Code validation failed.")}
    if verification is not None and not verification.get("verified", False): return {"action":"retry","reason":"Deterministic verification failed."}
    if audit is not None and not audit.get("verified", False): return {"action":"retry","reason":"Verifier Agent did not approve the result."}
    return {"action":"answer","reason":"Analysis passed reliability and verification checks."}
