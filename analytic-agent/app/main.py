# Analytical Agent API

from fastapi import FastAPI

app = FastAPI(title="Proof-Carrying Data Analyst", version="0.1.0")

@app.get("/")
def home():
    return {"status": "running", "agent": "Proof-Carrying Data Analyst"}
