from app.models.schemas import RuleCriterion, SifEvaluation

HIGH_ENERGY_KEYWORDS = [
    "forklift", "vehicle", "crane", "electrical", "high voltage", 
    "pressurized", "suspended load", "chemical", "rotating machinery"
]

EXPOSURE_KEYWORDS = [
    "worker", "pedestrian", "person", "employee", "operator", "near"
]

BARRIER_FAILURE_KEYWORDS = [
    "missing", "absent", "failed", "bypassed", "ineffective", "broken"
]

def evaluate_sif_potential(description: str) -> dict:
    text = description.lower()
    
    # 1. High-energy hazard
    has_hazard = any(keyword in text for keyword in HIGH_ENERGY_KEYWORDS)
    hazard_detail = "High-energy hazard detected." if has_hazard else "No high-energy hazard explicitly detected."
    
    # 2. Human exposure
    has_exposure = any(keyword in text for keyword in EXPOSURE_KEYWORDS)
    exposure_detail = "Human exposure detected in description." if has_exposure else "No clear human exposure mentioned."
    
    # 3. Critical barrier failure
    has_barrier_failure = any(keyword in text for keyword in BARRIER_FAILURE_KEYWORDS)
    barrier_detail = "Reported barrier failure or absence." if has_barrier_failure else "No barrier failure explicitly reported."
    
    criteria = [
        RuleCriterion(id="high_energy", label="High-energy hazard", met=has_hazard, detail=hazard_detail),
        RuleCriterion(id="human_exposure", label="Human exposure", met=has_exposure, detail=exposure_detail),
        RuleCriterion(id="barrier_failure", label="Barrier failure", met=has_barrier_failure, detail=barrier_detail),
    ]
    
    # Determine SIF Potential
    # A high-potential condition exists when the required criteria are met.
    # If information is missing or contradictory, route for human review ('undetermined').
    
    if has_hazard and has_exposure and has_barrier_failure:
        potential = "high"
        rationale = "High-energy hazard present with human exposure and reported barrier failure. High SIF potential."
    elif has_hazard and has_exposure:
        potential = "undetermined"
        rationale = "Hazard and exposure present, but barrier status is unknown. Needs human review."
    else:
        potential = "low"
        rationale = "Criteria for High SIF potential not met based on current evidence."

    return {
        "sif_potential": potential,
        "analysis": SifEvaluation(
            potential=potential,
            rationale=rationale,
            criteria=criteria
        )
    }

def mock_extract_facts(description: str) -> dict:
    """Mock NLP extraction based on simple keywords for the MVP."""
    text = description.lower()
    
    hazard_name = "Moving Vehicle" if "forklift" in text or "vehicle" in text else "Unknown Hazard"
    energy_source = "Kinetic" if "forklift" in text else "Unknown"
    human_exposure = "Workers near hazard" if any(k in text for k in EXPOSURE_KEYWORDS) else "None reported"
    barrier_status = "absent" if any(k in text for k in BARRIER_FAILURE_KEYWORDS) else "unknown"
    
    return {
        "hazard_name": hazard_name,
        "energy_source": energy_source,
        "human_exposure": human_exposure,
        "barrier_name": "Pedestrian Separation",
        "barrier_status": barrier_status,
        "consequence": "Potential severe injury",
        "evidence_phrases": [description[:50] + "..."], # Mock evidence
        "extraction_confidence": 0.85
    }
