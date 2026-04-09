from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from pydantic import BaseModel

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import TestCase, EvalResult
from judge import Llama3Judge
from evaluator import evaluate_all

from config import settings
from db import get_db, engine, Base, EvaluationRecord

# Create a global instance of our Llama-3 Judge
judge = None

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

def get_api_key(api_key_header_value: str = Security(api_key_header)) -> str:
    if api_key_header_value != settings.EVALS_API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid or missing API Key"
        )
    return api_key_header_value


class CompareRequest(BaseModel):
    prompt: str
    claude_response: str
    openai_response: str
    judge_model: str = "llama3"


class ApiResponse(BaseModel):
    status: str
    data: Any | None = None
    detail: str | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the DB Schema
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Initialize the judge chassis when the server boots
    global judge
    print("Initializing Local Llama-3 Judge for Live Evaluation...")
    # Map from the environment configuration settings
    judge = Llama3Judge(model="llama3", url=settings.OLLAMA_BASE_URL)
    yield
    print("Shutting down Eval Microservice...")

# Initialize the pure standalone FastAPI Server
app = FastAPI(
    title="AI-Eval Live Microservice",
    description="A decoupled, independent gateway to score AI responses in real-time.",
    version="1.0.0",
    lifespan=lifespan
)

# Open up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health", response_model=ApiResponse, tags=["System"])
async def health_check():
    return ApiResponse(status="success", data={"judge_ready": bool(judge)})


@app.get("/api/v1/history", response_model=ApiResponse, tags=["Evaluation"])
async def get_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EvaluationRecord).order_by(EvaluationRecord.timestamp.desc()).limit(100))
    records = result.scalars().all()
    
    serialized_data = [{
        "id": r.id,
        "timestamp": r.timestamp.isoformat(),
        "prompt": r.prompt,
        "responses": r.responses,
        "evaluations": r.evaluations
    } for r in records]
    
    return ApiResponse(status="success", data=serialized_data)


@app.post("/api/v1/evaluate", response_model=ApiResponse, tags=["Evaluation"])
async def evaluate_compare(request: CompareRequest, db: AsyncSession = Depends(get_db), api_key: str = Depends(get_api_key)):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required.")
    if not request.claude_response.strip() and not request.openai_response.strip():
        raise HTTPException(status_code=400, detail="At least one model response is required.")

    try:
        eval_result = evaluate_all(
            prompt=request.prompt,
            claude_response=request.claude_response,
            openai_response=request.openai_response,
            judge_model=request.judge_model,
        )["evaluations"]

        new_record = EvaluationRecord(
            id=str(uuid4()),
            timestamp=datetime.now(timezone.utc),
            prompt=request.prompt,
            responses={
                "1st_model": request.claude_response,
                "2nd_model": request.openai_response,
            },
            evaluations=eval_result
        )

        db.add(new_record)
        await db.commit()

        # Build response directly instead of pulling from JSON payload footprint
        record_dict = {
            "id": new_record.id,
            "timestamp": new_record.timestamp.isoformat(),
            "prompt": new_record.prompt,
            "responses": new_record.responses,
            "evaluations": new_record.evaluations
        }
        
        return ApiResponse(status="success", data=record_dict)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {exc}")


@app.post(
    "/api/v1/eval/faithfulness", 
    response_model=EvalResult,
    tags=["Real-Time Analytics"],
    summary="Evaluate Faithfulness instantly",
    description="Takes a live actual AI response + expected context and scores it in real-time via local Llama-3."
)
async def evaluate_realtime_faithfulness(case: TestCase, api_key: str = Depends(get_api_key)):
    """
    Expects a standard TestCase payload via HTTP POST.
    Immediately asks the Ollama Judge for a JSON grade and returns the Pydantic EvalResult.
    """
    if not judge:
        raise HTTPException(status_code=500, detail="The Judge is currently offline.")
        
    try:
        # We seamlessly bridge the API directly into our Independent Chassis!
        result = await judge.evaluate_faithfulness(case)
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM Evaluation failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
