def profile_dataframe(df) -> dict:
    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": [str(c) for c in df.columns],
        "missing_cells": int(df.isna().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
    }


def verify_result(df, plan: dict, result: dict) -> dict:
    from app.analyzer import analyze_dataframe

    reproduced = analyze_dataframe(df, plan)

    if "metric_value" in result:
        original_value = result.get("value")
        reproduced_value = reproduced.get("value")

        original_metric = result.get("metric_value", 0)
        reproduced_metric = reproduced.get("metric_value", 0)

        value_matches = original_value == reproduced_value
        metric_matches = abs(
            float(original_metric) - float(reproduced_metric)
        ) < 1e-9

        verified = value_matches and metric_matches
    else:
        original = result.get("value")
        reproduced_value = reproduced.get("value")

        if isinstance(original, (int, float)) and isinstance(
            reproduced_value, (int, float)
        ):
            verified = abs(
                float(original) - float(reproduced_value)
            ) < 1e-9
        else:
            verified = original == reproduced_value

    return {
        "verified": bool(verified),
        "reproduced_result": reproduced,
    }
