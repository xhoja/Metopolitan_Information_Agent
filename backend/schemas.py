from pydantic import BaseModel

class SubmissionCreate(BaseModel):
    file_url: str