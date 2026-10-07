import pandas as pd

def build_data_profile(df: pd.DataFrame) -> dict:
    missing = {str(c): int(v) for c, v in df.isna().sum().items() if int(v) > 0}
    duplicate_rows = int(df.duplicated().sum())
    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "missing_cells": int(df.isna().sum().sum()),
        "missing_by_column": missing,
        "duplicate_rows": duplicate_rows,
        "empty_columns": [str(c) for c in df.columns if df[c].dropna().empty],
        "column_names": [str(c) for c in df.columns],
        "reliability_flags": (
            (["empty_dataset"] if len(df) == 0 else [])
            + (["duplicate_rows_present"] if duplicate_rows else [])
            + (["missing_values_present"] if missing else [])
        ),
    }

def reliability_gate(profile: dict) -> dict:
    if profile["rows"] == 0:
        return {"reliable": False, "reason": "Dataset contains no rows."}
    if profile["empty_columns"]:
        return {"reliable": False, "reason": f"Dataset contains empty columns: {profile['empty_columns']}"}
    return {"reliable": True, "reason": "Dataset passed the basic reliability gate."}
