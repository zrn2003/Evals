from pydantic import BaseModel
from typing import List, Optional

class TestCase(BaseModel):
    id: str
    input: str
    actual_output: str
    context: List[str] = []
    expected_output: Optional[str] = None

class EvalResult(BaseModel):
    test_id: str
    scores: dict
    reasons: dict
