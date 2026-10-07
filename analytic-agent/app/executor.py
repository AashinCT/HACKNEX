import math
import pandas as pd

SAFE_BUILTINS = {
    "abs": abs,
    "float": float,
    "int": int,
    "len": len,
    "max": max,
    "min": min,
    "round": round,
    "str": str,
    "sum": sum,
}

def make_json_safe(value):
    if isinstance(value, dict):
        return {str(k): make_json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [make_json_safe(v) for v in value]
    if hasattr(value, "item"):
        return make_json_safe(value.item())
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    return value

def execute_code(code: str, df: pd.DataFrame) -> dict:
    # pandas is already provided as `pd`; remove the common redundant import
    # so the restricted sandbox does not need Python `__import__`.
    code = "\n".join(
        line for line in code.splitlines()
        if line.strip() not in {"import pandas as pd", "import pandas"}
    )

    namespace = {
        "__builtins__": SAFE_BUILTINS,
        "pd": pd,
        "df": df.copy(),
    }
    exec(code, namespace, namespace)
    if "result" not in namespace:
        raise ValueError("Generated code did not produce result.")
    return make_json_safe(namespace["result"])
