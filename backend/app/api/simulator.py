from fastapi import APIRouter, HTTPException, Body, Query
from typing import Dict, Any, Optional
from app.services.simulation_engine import (
    SimulationEngine,
    UserBiomarkers,
    LifestyleHabits,
    SimulationResult
)
from app.services.ocr_service import MedicalReportOCRService
from app.rag.timeline_builder import TimelineBuilder

router = APIRouter(prefix="/simulator", tags=["AI Future Life Simulator & Evidence Evolution"])

@router.post("/simulate", response_model=SimulationResult)
async def run_simulation(payload: Dict[str, Any] = Body(...)):
    """Runs full 4-scenario future health simulation across 1, 3, 5, and 10 years."""
    try:
        biomarkers_data = payload.get("biomarkers", {})
        habits_data = payload.get("lifestyle_habits", {})

        biomarkers = UserBiomarkers(**biomarkers_data) if biomarkers_data else UserBiomarkers()
        habits = LifestyleHabits(**habits_data) if habits_data else LifestyleHabits()

        return SimulationEngine.generate_simulation(biomarkers, habits)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Simulation error: {str(e)}")

@router.post("/adjust-slider")
async def adjust_habit_slider(payload: Dict[str, Any] = Body(...)):
    """Instant sub-second slider recalculation for live interactive risk adjustments."""
    try:
        exercise_mins = int(payload.get("exercise_minutes_per_day", 15))
        sleep_hours = float(payload.get("sleep_hours", 6.0))
        fast_food_days = int(payload.get("fast_food_meals_per_week", 3))
        water_liters = float(payload.get("daily_water_liters", 1.8))
        stress_level = int(payload.get("stress_level_1_to_10", 7))
        current_score = int(payload.get("current_health_score", 76))
        base_diabetes_risk = int(payload.get("base_diabetes_risk_pct", 38))
        base_heart_risk = int(payload.get("base_heart_risk_pct", 24))
        base_weight = float(payload.get("base_weight_kg", 82.0))

        return SimulationEngine.adjust_slider_delta(
            exercise_mins=exercise_mins,
            sleep_hours=sleep_hours,
            fast_food_days=fast_food_days,
            water_liters=water_liters,
            stress_level=stress_level,
            current_score=current_score,
            base_diabetes_risk=base_diabetes_risk,
            base_heart_risk=base_heart_risk,
            base_weight=base_weight
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Slider adjustment error: {str(e)}")

@router.post("/parse-report")
async def parse_medical_report(payload: Dict[str, Any] = Body(...)):
    """Extracts clinical biomarker values from uploaded report text or OCR strings."""
    raw_text = payload.get("report_text", "")
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Report text content is required.")
    return MedicalReportOCRService.parse_report_text(raw_text)

@router.get("/evolution-topics")
async def get_evolution_topics():
    """Returns available historical discovery topics."""
    return TimelineBuilder.list_evolution_topics()

@router.get("/evolution-timeline")
async def get_evolution_timeline(topic: Optional[str] = Query(None)):
    """Returns the comprehensive Evidence Evolution Timeline with year-by-year star ratings."""
    return TimelineBuilder.get_evolution_timeline(topic)
