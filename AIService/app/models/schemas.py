from pydantic import BaseModel, Field
from typing import List, Optional

class ReportInput(BaseModel):
    id: str
    title: str
    description: str
    report_type: str
    location: Optional[str] = None

class RuleCriterion(BaseModel):
    id: str
    label: str
    met: bool
    detail: str

class SifEvaluation(BaseModel):
    potential: str = Field(description="'high', 'medium', 'low', or 'undetermined'")
    rationale: str
    criteria: List[RuleCriterion]

class AnalysisOutput(BaseModel):
    report_id: str
    hazard_name: str
    energy_source: str
    human_exposure: str
    barrier_name: str
    barrier_status: str
    consequence: str
    sif_potential: str
    analysis: SifEvaluation
    evidence_phrases: List[str]
    extraction_confidence: float
