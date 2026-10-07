import ollama

CODER_MODEL = "qwen2.5-coder:latest"

def repair_code(question: str, schema: str, plan: dict, broken_code: str, error: str) -> str:
    prompt = ("Repair this Python/Pandas analysis code.\n\n"
        "QUESTION:\n" + question + "\n\nSCHEMA:\n" + schema +
        "\n\nPLAN:\n" + str(plan) + "\n\nBROKEN CODE:\n" + broken_code +
        "\n\nERROR:\n" + error +
        "\n\nReturn ONLY corrected Python code. Use df and assign final output to result. No file/network/shell access.")
    response = ollama.chat(model=CODER_MODEL, messages=[
        {"role":"system","content":"You repair Python/Pandas analysis code. Return only executable code."},
        {"role":"user","content":prompt},
    ], options={'temperature':0})
    return response["message"]["content"].strip().replace("```python","").replace("```","").strip()
