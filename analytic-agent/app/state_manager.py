class StateManager:
    def __init__(self):
        self.sessions = {}

    def start(self, session_id, dataset):
        if session_id not in self.sessions:
            self.sessions[session_id] = {"dataset": dataset, "queries": []}
        else:
            self.sessions[session_id]["dataset"] = dataset

    def record(self, session_id, query):
        self.sessions.setdefault(session_id, {"dataset": None, "queries": []})
        self.sessions[session_id]["queries"].append(query)

    def get(self, session_id):
        return self.sessions.get(session_id)
