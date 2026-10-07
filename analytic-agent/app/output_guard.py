def guard_output(answer, generated_code, verification, audit):
    if answer is None: return {"safe":False,"reason":"No answer was produced."}
    if not generated_code or "result" not in generated_code: return {"safe":False,"reason":"Proof code is missing or does not produce result."}
    if not verification.get("verified",False): return {"safe":False,"reason":"Deterministic verification failed."}
    if not audit.get("verified",False): return {"safe":False,"reason":"Verifier Agent did not approve the result."}
    return {"safe":True,"reason":"Output passed final consistency guard."}
