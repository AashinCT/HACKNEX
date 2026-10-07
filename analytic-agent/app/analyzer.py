import pandas as pd


SUPPORTED_INTENTS = {
    "count_rows",
    "sum",
    "average",
    "minimum",
    "maximum",
    "groupby_sum",
    "groupby_average",
    "groupby_minimum",
    "groupby_maximum",
}


def analyze_dataframe(df: pd.DataFrame, plan: dict) -> dict:
    intent = plan.get("intent")
    target = plan.get("target_column")
    group_by = plan.get("group_by")

    if intent == "count_rows":
        return {
            "value": int(len(df)),
            "operation": intent,
        }

    if target not in df.columns:
        raise ValueError(f"Column not found: {target}")

    if intent in {"sum", "average", "minimum", "maximum"}:
        series = pd.to_numeric(
            df[target],
            errors="coerce"
        ).dropna()

        if series.empty:
            raise ValueError(
                f"No usable numeric values in {target}."
            )

        functions = {
            "sum": series.sum,
            "average": series.mean,
            "minimum": series.min,
            "maximum": series.max,
        }

        value = functions[intent]()

        return {
            "value": float(value),
            "operation": intent,
            "column": target,
        }

    if intent.startswith("groupby_"):
        if group_by not in df.columns:
            raise ValueError(
                f"Group-by column not found: {group_by}"
            )

        grouped = df.groupby(group_by)[target].apply(
            lambda x: pd.to_numeric(
                x,
                errors="coerce"
            ).sum()
            if intent == "groupby_sum"
            else pd.to_numeric(
                x,
                errors="coerce"
            ).mean()
            if intent == "groupby_average"
            else pd.to_numeric(
                x,
                errors="coerce"
            ).min()
            if intent == "groupby_minimum"
            else pd.to_numeric(
                x,
                errors="coerce"
            ).max()
        )

        grouped = grouped.dropna()

        if grouped.empty:
            raise ValueError(
                f"No usable numeric values in {target}."
            )

        if intent == "groupby_sum":
            answer = grouped.idxmax()
            value = grouped.max()

        elif intent == "groupby_average":
            answer = grouped.idxmax()
            value = grouped.max()

        elif intent == "groupby_minimum":
            answer = grouped.idxmin()
            value = grouped.min()

        elif intent == "groupby_maximum":
            answer = grouped.idxmax()
            value = grouped.max()

        else:
            raise ValueError(
                f"Unsupported intent: {intent}"
            )

        return {
            "value": answer,
            "metric_value": float(value),
            "operation": intent,
            "column": target,
            "group_by": group_by,
        }

    raise ValueError(
        f"Unsupported analytical intent: {intent}"
    )