import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_simulator_simulate_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "biomarkers": {
                "name": "Farhan",
                "age": 30,
                "weight_kg": 78.0,
                "height_cm": 178.0,
                "fasting_glucose_mg_dl": 110.0,
                "hba1c_pct": 5.9
            },
            "lifestyle_habits": {
                "sleep_hours": 7.0,
                "exercise_minutes_per_day": 30,
                "exercise_days_per_week": 4,
                "daily_water_liters": 2.5,
                "fast_food_meals_per_week": 1,
                "stress_level_1_to_10": 4
            }
        }
        res = await ac.post("/api/simulator/simulate", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "current_health_score" in data
        assert len(data["scenarios"]) == 4
        assert "micro_habit_plan" in data
        assert len(data["longitudinal_timeline"]) >= 4

@pytest.mark.asyncio
async def test_simulator_adjust_slider_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "exercise_minutes_per_day": 45,
            "sleep_hours": 8.0,
            "fast_food_meals_per_week": 0,
            "daily_water_liters": 3.0,
            "stress_level_1_to_10": 3,
            "current_health_score": 75,
            "base_diabetes_risk_pct": 35,
            "base_heart_risk_pct": 25,
            "base_weight_kg": 80.0
        }
        res = await ac.post("/api/simulator/adjust-slider", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["health_score"] > 75
        assert data["diabetes_risk_pct"] < 35

@pytest.mark.asyncio
async def test_simulator_parse_report_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        sample_report = """
        DIAGNOSTIC LAB REPORT
        Patient: Mohammed A. Age: 34
        Fasting Blood Glucose: 135 mg/dL
        HbA1c: 6.4 %
        Total Cholesterol: 220 mg/dL
        LDL Cholesterol: 170 mg/dL
        HDL: 38 mg/dL
        Blood Pressure: 138/88 mmHg
        SGPT (ALT): 44 U/L
        Creatinine: 1.0 mg/dL
        """
        res = await ac.post("/api/simulator/parse-report", json={"report_text": sample_report})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        bms = data["biomarkers"]
        assert bms["fasting_glucose_mg_dl"] == 135.0
        assert bms["hba1c_pct"] == 6.4
        assert bms["ldl_cholesterol_mg_dl"] == 170.0
        assert bms["systolic_bp"] == 138

@pytest.mark.asyncio
async def test_evolution_timeline_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/simulator/evolution-timeline?topic=brca1_olaparib")
        assert res.status_code == 200
        data = res.json()
        assert data["topic_id"] == "brca1_olaparib"
        assert len(data["timeline_nodes"]) >= 6
        assert data["timeline_nodes"][0]["evidence_strength_stars"] == 1
        assert data["timeline_nodes"][-1]["evidence_strength_stars"] == 5
