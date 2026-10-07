from datetime import datetime, timezone

class TraceLogger:
    def __init__(self): self.events=[]
    def add(self, stage, status, details=None):
        self.events.append({"timestamp":datetime.now(timezone.utc).isoformat(),"stage":stage,"status":status,"details":details or {}})
    def export(self): return {"events":self.events,"event_count":len(self.events)}
