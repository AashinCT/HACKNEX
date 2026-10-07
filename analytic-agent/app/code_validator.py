import ast

ALLOWED_IMPORTS = {"pandas"}
BLOCKED_NAMES = {
    "eval", "exec", "open", "__import__", "compile", "input",
    "breakpoint", "globals", "locals", "vars",
}
BLOCKED_MODULES = {
    "os", "sys", "subprocess", "socket", "requests", "pathlib",
    "shutil", "pickle", "builtins",
}

def validate_code(code: str) -> dict:
    try:
        tree = ast.parse(code, mode="exec")
    except SyntaxError as exc:
        return {"valid": False, "reason": f"Generated code has a syntax error: {exc}"}

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split(".")[0] not in ALLOWED_IMPORTS:
                    return {"valid": False, "reason": f"Import not allowed: {alias.name}"}
        elif isinstance(node, ast.ImportFrom):
            if node.module not in ALLOWED_IMPORTS:
                return {"valid": False, "reason": f"Import not allowed: {node.module}"}
        elif isinstance(node, ast.Name) and node.id in BLOCKED_NAMES:
            return {"valid": False, "reason": f"Blocked operation: {node.id}"}
        elif isinstance(node, ast.Attribute):
            if node.attr.startswith("__"):
                return {"valid": False, "reason": "Dunder attribute access is not allowed."}

    assigned = {node.id for node in ast.walk(tree) if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store)}
    if "result" not in assigned:
        return {"valid": False, "reason": "Generated code must assign its final answer to result."}

    return {"valid": True, "reason": "Code passed AST safety validation."}
