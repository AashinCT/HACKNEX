import pandas as pd

def resolve_schema(df: pd.DataFrame) -> dict:
    columns = []
    for name, dtype in df.dtypes.items():
        series = df[name]
        sample = series.dropna().head(3).tolist()
        columns.append({
            "name": str(name),
            "dtype": str(dtype),
            "missing": int(series.isna().sum()),
            "unique": int(series.nunique(dropna=True)),
            "sample": [str(x) for x in sample],
        })
    return {
        "rows": int(len(df)),
        "columns": columns,
        "numeric_columns": [str(c) for c in df.select_dtypes(include="number").columns],
        "date_like_columns": [str(c) for c in df.columns if "date" in str(c).lower() or "time" in str(c).lower()],
    }
