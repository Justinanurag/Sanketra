from fastapi import APIRouter
from app.models.schemas import ReportInput, AnalysisOutput
from app.core.rules import evaluate_sif_potential, mock_extract_facts

router = APIRouter()

@router.post("/analyze", response_model=AnalysisOutput)
async def analyze_report(report: ReportInput):
    # Extract facts (Mock NLP)
    facts = mock_extract_facts(report.description)
    
    # Evaluate SIF rules
    evaluation = evaluate_sif_potential(report.description)
    
    return AnalysisOutput(
        report_id=report.id,
        hazard_name=facts["hazard_name"],
        energy_source=facts["energy_source"],
        human_exposure=facts["human_exposure"],
        barrier_name=facts["barrier_name"],
        barrier_status=facts["barrier_status"],
        consequence=facts["consequence"],
        evidence_phrases=facts["evidence_phrases"],
        extraction_confidence=facts["extraction_confidence"],
        sif_potential=evaluation["sif_potential"],
        analysis=evaluation["analysis"]
    )
