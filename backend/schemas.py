from pydantic import BaseModel

class SubmissionCreate(BaseModel):
    content: str