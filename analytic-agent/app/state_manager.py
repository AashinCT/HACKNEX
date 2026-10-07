class StateManager:
    def __init__(self): self.sessions={}
    def start(self, session_id, dataset): self.sessions[session_id]={'dataset':dataset,'queries':[]}
    def record(self, session_id, query):
        self.sessions.setdefault(session_id,{'dataset':None,'queries':[]})['queries'].append(query)
    def get(self, session_id): return self.sessions.get(session_id)
