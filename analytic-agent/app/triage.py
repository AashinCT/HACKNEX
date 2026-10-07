import re

def triage_question(question: str) -> dict:
    q = question.strip()
    if not q:
        return {"status":"refuse","reason":"Question is empty."}

    lower = q.lower()
    if len(q) > 1000:
        return {"status":"refuse","reason":"Question is too long for the MVP analysis route."}

    if any(term in lower for term in ["delete file", "run command", "execute shell", "send email", "hack", "password", "api key"]):
        return {"status":"refuse","reason":"Request is outside the analytical data scope."}

    if any(term in lower for term in ["which", "what", "how many", "how much", "average", "mean", "total", "sum", "maximum", "minimum", "highest", "lowest", "count", "compare", "trend"]):
        return {"status":"answerable","reason":"Question appears to request a data analysis."}

    return {"status":"ambiguous","reason":"The agent could not confidently classify this as a supported data-analysis question."}
