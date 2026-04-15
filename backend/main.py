from fastapi import FastAPI
from agent.mia import router as mia_router
 

app = FastAPI()

app.include_router(mia_router, prefix="/mia")