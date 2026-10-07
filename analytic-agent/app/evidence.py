import pandas as pd

def extract_evidence(df: pd.DataFrame, plan: dict, result: dict) -> dict:
    intent = plan.get("intent")
    target = plan.get("target_column")
    group_by = plan.get("group_by")

    if intent == "count_rows":
        rows = df.head(20).copy()
    elif intent.startswith("groupby_") and group_by in df.columns:
        answer = result.get("value")
        rows = df[df[group_by].astype(str) == str(answer)].copy()
    elif target in df.columns:
        numeric = pd.to_numeric(df[target], errors="coerce")
        rows = df.loc[numeric.notna()].copy()
        rows = rows.sort_values(target, ascending=False).head(20)
    else:
        rows = df.head(20).copy()

    return {
        "row_count": int(len(rows)),
        "columns": [str(c) for c in rows.columns],
        "rows": rows.astype(object).where(pd.notna(rows), None).to_dict(orient="records"),
    }
