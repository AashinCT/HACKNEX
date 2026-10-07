def validate_input(question: str) -> dict:
    q = question.strip()
    if not q:
        return {"allowed": False, "reason": "Question is empty."}
    if len(q) > 1000:
        return {"allowed": False, "reason": "Question exceeds the supported length."}
    blocked = ["delete file", "run command", "execute shell", "send email", "steal password", "api key", "hack"]
    lower = q.lower()
    for term in blocked:
        if term in lower:
            return {"allowed": False, "reason": "Request is outside the analytical data scope."}
    return {"allowed": True, "reason": "Input passed the guard."}
