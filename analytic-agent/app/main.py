# FastAPI entry point for the PSI08 Proof-Carrying Data Analyst
from pathlib import Path
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.analyzer import analyze_dataframe
from app.llm import ask_qwen3, ask_coder
from app.verifier import profile_dataframe, verify_result

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'data'
app = FastAPI(title='Proof-Carrying Data Analyst', version='0.1.0')

class AnalyzeRequest(BaseModel):
    question: str
    dataset: str = 'sales.csv'

def load_dataset(dataset: str):
    path = DATA_DIR / dataset
    if path.suffix.lower() != '.csv':
        raise HTTPException(400, 'MVP currently supports CSV datasets only.')
    if not path.exists():
        raise HTTPException(404, f'Dataset not found: {dataset}')
    return pd.read_csv(path)

@app.get('/')
def home():
    return {'status':'running','agent':'Proof-Carrying Data Analyst','model':'qwen3:8b'}

@app.get('/api/profile')
def profile(dataset: str='sales.csv'):
    return profile_dataframe(load_dataset(dataset))

@app.post('/api/analyze')
def analyze(request: AnalyzeRequest):
    df = load_dataset(request.dataset)
    schema = '\n'.join(f'- {c}: {d}' for c,d in df.dtypes.items())
    try:
        plan = ask_qwen3(request.question, schema)
        if plan['intent'] == 'unknown':
            return {'status':'refused','question':request.question,'reason':plan['reason'],'evidence':{'profile':profile_dataframe(df),'plan':plan}}
        generated_code = ask_coder(request.question, schema, plan)
        result = analyze_dataframe(df, plan)
        verification = verify_result(df, plan, result)
        if not verification['verified']:
            return {'status':'refused','question':request.question,'reason':'Result verification failed.','evidence':verification}
        return {'status':'verified','question':request.question,'answer':result['value'],'metric_value':result.get('metric_value'),'operation':result['operation'],'source':request.dataset,'confidence':0.98,'plan':plan,'evidence':{'profile':profile_dataframe(df),'verification':verification}}
    except ValueError as exc:
        return {'status':'refused','question':request.question,'reason':str(exc),'evidence':{'dataset':request.dataset}}
    except Exception as exc:
        raise HTTPException(500, str(exc))
