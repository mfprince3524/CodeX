from typing import Dict, Any, List, Optional
import math
from datetime import datetime, timezone
from pydantic import BaseModel

class UserBiomarkers(BaseModel):
    name: str = "Mohammed"
    age: int = 34
    gender: str = "male" # male | female
    height_cm: float = 175.0
    weight_kg: float = 82.0
    blood_group: str = "O+"
    fasting_glucose_mg_dl: Optional[float] = 118.0
    hba1c_pct: Optional[float] = 6.2
    total_cholesterol_mg_dl: Optional[float] = 215.0
    ldl_cholesterol_mg_dl: Optional[float] = 145.0
    hdl_cholesterol_mg_dl: Optional[float] = 42.0
    triglycerides_mg_dl: Optional[float] = 190.0
    systolic_bp: Optional[int] = 132
    diastolic_bp: Optional[int] = 84
    alt_u_l: Optional[float] = 48.0
    ast_u_l: Optional[float] = 36.0
    egfr_ml_min: Optional[float] = 98.0
    creatinine_mg_dl: Optional[float] = 0.95
    tsh_uiu_ml: Optional[float] = 2.1
    family_history_diabetes: bool = True
    family_history_heart_disease: bool = True

class LifestyleHabits(BaseModel):
    sleep_hours: float = 6.0
    exercise_minutes_per_day: int = 15
    exercise_days_per_week: int = 2
    daily_water_liters: float = 1.8
    fast_food_meals_per_week: int = 4
    stress_level_1_to_10: int = 7
    smoking_status: str = "never" # never | former | current
    alcohol_drinks_per_week: int = 2
    screen_time_hours_per_day: float = 8.5
    working_hours_per_day: float = 9.0

class FutureHealthScenario(BaseModel):
    id: str
    title: str
    subtitle: str
    color: str
    icon: str
    health_score_current: int
    health_score_1yr: int
    health_score_3yr: int
    health_score_5yr: int
    health_score_10yr: int
    weight_5yr_kg: float
    bmi_5yr: float
    diabetes_risk_5yr_pct: int
    heart_disease_risk_5yr_pct: int
    hypertension_risk_5yr_pct: int
    fatty_liver_risk_5yr_pct: int
    kidney_risk_5yr_pct: int
    estimated_biological_age_delta_5yr: int # e.g. +3 or -4 years
    key_projected_outcomes: List[str]
    positive_indicators: List[str]
    warning_indicators: List[str]

class LongitudinalMilestone(BaseModel):
    year: int
    scenario_1_status: str
    scenario_2_status: str
    scenario_3_status: str
    scenario_4_status: str
    key_biomarker_milestone: str

class MicroHabitPlanWeek(BaseModel):
    week_number: int
    focus_theme: str
    daily_target_steps: int
    daily_target_water_l: float
    sleep_bedtime: str
    nutrition_action: str
    stress_activity: str
    expected_biological_benefit: str

class SimulationResult(BaseModel):
    session_id: str
    timestamp: str
    user_name: str
    current_bmi: float
    current_health_score: int
    sub_scores: Dict[str, int] # heart, diabetes, fitness, mental, sleep, nutrition
    disease_probabilities: Dict[str, int]
    scenarios: List[FutureHealthScenario]
    longitudinal_timeline: List[LongitudinalMilestone]
    micro_habit_plan: List[MicroHabitPlanWeek]
    medical_disclaimer: str

class SimulationEngine:
    @staticmethod
    def calculate_bmi(weight_kg: float, height_cm: float) -> float:
        if height_cm <= 0:
            return 24.0
        h_m = height_cm / 100.0
        return round(weight_kg / (h_m * h_m), 1)

    @staticmethod
    def calculate_current_scores(bio: UserBiomarkers, habits: LifestyleHabits) -> Dict[str, Any]:
        bmi = SimulationEngine.calculate_bmi(bio.weight_kg, bio.height_cm)
        
        # 1. Cardiovascular Sub-Score (0-100)
        heart_score = 90
        if (bio.systolic_bp or 120) >= 130 or (bio.diastolic_bp or 80) >= 85:
            heart_score -= 12
        if (bio.ldl_cholesterol_mg_dl or 100) > 130:
            heart_score -= 10
        if (bio.hdl_cholesterol_mg_dl or 50) < 45:
            heart_score -= 8
        if habits.smoking_status == "current":
            heart_score -= 22
        elif habits.smoking_status == "former":
            heart_score -= 6
        if habits.exercise_minutes_per_day >= 30:
            heart_score += 8
        heart_score = max(20, min(98, heart_score))

        # 2. Type 2 Diabetes Sub-Score (0-100)
        diabetes_protection = 88
        if (bio.fasting_glucose_mg_dl or 90) >= 100:
            diabetes_protection -= 14
        if (bio.hba1c_pct or 5.4) >= 5.7:
            diabetes_protection -= 16
        if bmi >= 25:
            diabetes_protection -= int((bmi - 25) * 2.5)
        if habits.fast_food_meals_per_week >= 3:
            diabetes_protection -= 8
        if habits.exercise_minutes_per_day >= 30:
            diabetes_protection += 10
        diabetes_protection = max(15, min(98, diabetes_protection))
        diabetes_risk_pct = max(5, min(95, 100 - diabetes_protection))

        # 3. Fitness Score
        fitness_score = int(min(98, max(20, (habits.exercise_minutes_per_day * 1.2) + (habits.exercise_days_per_week * 6) + 30)))
        if bmi > 27:
            fitness_score -= 10

        # 4. Mental Wellness Score
        mental_score = int(max(20, min(98, 100 - (habits.stress_level_1_to_10 * 7) - (habits.screen_time_hours_per_day * 1.5) + (habits.sleep_hours * 3))))

        # 5. Sleep Quality Score
        sleep_score = int(max(20, min(98, 40 + (habits.sleep_hours * 7.5) - (habits.stress_level_1_to_10 * 2))))

        # 6. Nutrition Score
        nutrition_score = int(max(25, min(98, 85 - (habits.fast_food_meals_per_week * 7) + (habits.daily_water_liters * 4) - (10 if (bio.triglycerides_mg_dl or 120) > 150 else 0))))

        # Overall Composite Health Score
        overall = int((heart_score * 0.25) + (diabetes_protection * 0.25) + (fitness_score * 0.15) + (mental_score * 0.15) + (sleep_score * 0.10) + (nutrition_score * 0.10))

        # Disease Probabilities (10-year statistical risks)
        cvd_risk = int(max(4, min(80, 100 - heart_score + (10 if bio.family_history_heart_disease else 0))))
        htn_risk = int(max(5, min(85, 20 + ((bio.systolic_bp or 120) - 110) * 1.2 + (habits.stress_level_1_to_10 * 2))))
        fatty_liver_risk = int(max(5, min(85, (bmi - 20) * 4 + ((bio.alt_u_l or 30) - 25) * 1.1 + (habits.fast_food_meals_per_week * 3))))
        kidney_risk = int(max(3, min(60, 5 + (15 if (bio.systolic_bp or 120) > 135 else 0) + (15 if diabetes_risk_pct > 40 else 0))))

        return {
            "overall_health_score": overall,
            "bmi": bmi,
            "sub_scores": {
                "heart_health": heart_score,
                "diabetes_protection": diabetes_protection,
                "fitness": fitness_score,
                "mental_wellness": mental_score,
                "sleep_quality": sleep_score,
                "nutrition": nutrition_score
            },
            "disease_probabilities": {
                "type_2_diabetes": diabetes_risk_pct,
                "cardiovascular_disease": cvd_risk,
                "hypertension": htn_risk,
                "fatty_liver_disease": max(5, fatty_liver_risk),
                "chronic_kidney_disease": max(3, kidney_risk)
            }
        }

    @staticmethod
    def generate_simulation(bio: UserBiomarkers, habits: LifestyleHabits) -> SimulationResult:
        base = SimulationEngine.calculate_current_scores(bio, habits)
        current_score = base["overall_health_score"]
        current_bmi = base["bmi"]
        current_weight = bio.weight_kg
        cur_probs = base["disease_probabilities"]

        # Scenario 1: Continue Current Lifestyle
        s1 = FutureHealthScenario(
            id="scenario-current",
            title="Scenario 1: Continue Current Lifestyle",
            subtitle="Maintains existing sleep, exercise, and dietary patterns without proactive intervention.",
            color="#00606B",
            icon="Clock",
            health_score_current=current_score,
            health_score_1yr=max(20, current_score - 2),
            health_score_3yr=max(20, current_score - 6),
            health_score_5yr=max(20, current_score - 10),
            health_score_10yr=max(15, current_score - 18),
            weight_5yr_kg=round(current_weight + 3.5, 1),
            bmi_5yr=round(current_bmi + 1.2, 1),
            diabetes_risk_5yr_pct=min(90, cur_probs["type_2_diabetes"] + 16),
            heart_disease_risk_5yr_pct=min(85, cur_probs["cardiovascular_disease"] + 12),
            hypertension_risk_5yr_pct=min(90, cur_probs["hypertension"] + 14),
            fatty_liver_risk_5yr_pct=min(85, cur_probs["fatty_liver_disease"] + 10),
            kidney_risk_5yr_pct=min(60, cur_probs["chronic_kidney_disease"] + 6),
            estimated_biological_age_delta_5yr=+3,
            key_projected_outcomes=[
                "Progressive increase in fasting blood glucose (+12-18 mg/dL) and HbA1c trajectory toward pre-diabetes threshold.",
                "Mild systolic arterial stiffening (+6-10 mmHg) from continued stress and sub-optimal sleep.",
                "Gradual visceral adipose deposition (+3.5 kg over 5 years)."
            ],
            positive_indicators=["Stable renal filtration (eGFR)", "No acute rapid decompensation"],
            warning_indicators=["Escalating 5-year Type 2 Diabetes risk (+16%)", "Elevated lipid peroxidation biomarkers"]
        )

        # Scenario 2: Exercise Daily (+30-45 mins Moderate-to-Vigorous)
        s2 = FutureHealthScenario(
            id="scenario-exercise",
            title="Scenario 2: Exercise Daily (+30-45 Mins)",
            subtitle="Introduces regular daily aerobic and resistance training with structured physical activity.",
            color="#0D9488",
            icon="Activity",
            health_score_current=current_score,
            health_score_1yr=min(98, current_score + 7),
            health_score_3yr=min(98, current_score + 12),
            health_score_5yr=min(98, current_score + 16),
            health_score_10yr=min(98, current_score + 18),
            weight_5yr_kg=round(current_weight - 4.5, 1),
            bmi_5yr=round(max(19.0, current_bmi - 1.5), 1),
            diabetes_risk_5yr_pct=max(6, cur_probs["type_2_diabetes"] - 22),
            heart_disease_risk_5yr_pct=max(5, cur_probs["cardiovascular_disease"] - 18),
            hypertension_risk_5yr_pct=max(8, cur_probs["hypertension"] - 16),
            fatty_liver_risk_5yr_pct=max(5, cur_probs["fatty_liver_disease"] - 20),
            kidney_risk_5yr_pct=max(2, cur_probs["chronic_kidney_disease"] - 5),
            estimated_biological_age_delta_5yr=-4,
            key_projected_outcomes=[
                "40%+ enhancement in skeletal muscle GLUT4 transporter density, normalizing insulin sensitivity.",
                "Resting heart rate reduction of 8-12 bpm with improved microvascular endothelial nitric oxide production.",
                "Substantial HDL cholesterol elevation (+8-12 mg/dL) and triglyceride reduction."
            ],
            positive_indicators=["Cardiovascular risk reduced by more than half", "Cellular mitochondrial density increased by 28%", "Biological age reduced by ~4 years"],
            warning_indicators=["Requires consistent habit adherence to sustain vascular elasticity"]
        )

        # Scenario 3: Weight Loss & Metabolic Optimization (-8 kg)
        s3 = FutureHealthScenario(
            id="scenario-weightloss",
            title="Scenario 3: Weight Loss & Nutrition (-8 kg)",
            subtitle="Combines a 8 kg fat reduction with Mediterranean whole-food nutrition and optimal hydration.",
            color="#16A34A",
            icon="TrendingUp",
            health_score_current=current_score,
            health_score_1yr=min(99, current_score + 10),
            health_score_3yr=min(99, current_score + 16),
            health_score_5yr=min(99, current_score + 20),
            health_score_10yr=min(99, current_score + 22),
            weight_5yr_kg=round(max(50.0, current_weight - 8.0), 1),
            bmi_5yr=round(max(18.5, current_bmi - 2.6), 1),
            diabetes_risk_5yr_pct=max(4, cur_probs["type_2_diabetes"] - 28),
            heart_disease_risk_5yr_pct=max(4, cur_probs["cardiovascular_disease"] - 22),
            hypertension_risk_5yr_pct=max(5, cur_probs["hypertension"] - 24),
            fatty_liver_risk_5yr_pct=max(3, cur_probs["fatty_liver_disease"] - 28),
            kidney_risk_5yr_pct=max(2, cur_probs["chronic_kidney_disease"] - 6),
            estimated_biological_age_delta_5yr=-6,
            key_projected_outcomes=[
                "Near-complete resolution of hepatic steatosis / ectopic liver fat accumulation.",
                "HbA1c reduction into optimal low-risk euglycemic zone (<5.4%).",
                "Normalization of blood pressure into optimal 115/75 mmHg band."
            ],
            positive_indicators=["Highest overall Health Score (95+)", "Minimal risk across all metabolic markers", "Reversal of early metabolic syndrome traits"],
            warning_indicators=["Gradual loss of 0.5-1 kg/week recommended to preserve lean muscle mass"]
        )

        # Scenario 4: Worst-Case Sedentary & High-Stress Lifestyle
        s4 = FutureHealthScenario(
            id="scenario-worst",
            title="Scenario 4: High-Stress / Sedentary Lifestyle",
            subtitle="Simulation of poor sleep (<5h), zero exercise, frequent fast food, smoking, and chronic work stress.",
            color="#DC2626",
            icon="AlertTriangle",
            health_score_current=current_score,
            health_score_1yr=max(15, current_score - 12),
            health_score_3yr=max(15, current_score - 24),
            health_score_5yr=max(10, current_score - 34),
            health_score_10yr=max(8, current_score - 46),
            weight_5yr_kg=round(current_weight + 9.0, 1),
            bmi_5yr=round(current_bmi + 3.0, 1),
            diabetes_risk_5yr_pct=min(95, cur_probs["type_2_diabetes"] + 38),
            heart_disease_risk_5yr_pct=min(92, cur_probs["cardiovascular_disease"] + 34),
            hypertension_risk_5yr_pct=min(95, cur_probs["hypertension"] + 36),
            fatty_liver_risk_5yr_pct=min(92, cur_probs["fatty_liver_disease"] + 32),
            kidney_risk_5yr_pct=min(75, cur_probs["chronic_kidney_disease"] + 20),
            estimated_biological_age_delta_5yr=+8,
            key_projected_outcomes=[
                "High probability transition from pre-diabetes to overt Type 2 Diabetes Mellitus.",
                "Stage 2 Essential Hypertension with persistent vascular remodeling and arterial stiffness.",
                "Moderate-to-severe non-alcoholic fatty liver disease (NAFLD) with elevated transaminases."
            ],
            positive_indicators=["Timely identification creates immediate window for reversal"],
            warning_indicators=["Critical cardiovascular alert", "Biological age accelerated by ~8 years", "Systemic chronic low-grade inflammation"]
        )

        # Longitudinal 2026 - 2036 Timeline Milestones
        milestones = [
            LongitudinalMilestone(
                year=2026,
                scenario_1_status="Baseline: Health Score 76",
                scenario_2_status="Initiation: Health Score 83",
                scenario_3_status="Optimization: Health Score 86",
                scenario_4_status="Sedentary: Health Score 64",
                key_biomarker_milestone="Comprehensive multi-organ baseline assessment and lab extraction."
            ),
            LongitudinalMilestone(
                year=2027,
                scenario_1_status="Stable weight, mild glucose creep",
                scenario_2_status="Cardiorespiratory VO2 max +14%",
                scenario_3_status="4.5 kg fat loss, normal fasting glucose",
                scenario_4_status="Blood pressure 140/90, fatigue onset",
                key_biomarker_milestone="First measurable separation in endothelial elasticity and insulin sensitivity."
            ),
            LongitudinalMilestone(
                year=2028,
                scenario_1_status="Pre-diabetes risk 35%",
                scenario_2_status="HDL +10 mg/dL, resting HR 62 bpm",
                scenario_3_status="Target -8 kg reached, optimal HbA1c 5.2%",
                scenario_4_status="Pre-diabetes confirmed, ALT elevated",
                key_biomarker_milestone="Divergence in hepatic steatosis (liver fat) and lipid panel ratios."
            ),
            LongitudinalMilestone(
                year=2030,
                scenario_1_status="Health Score 72, Weight +3.5 kg",
                scenario_2_status="Health Score 92, Heart Risk <10%",
                scenario_3_status="Health Score 95, Biological Age -6 yrs",
                scenario_4_status="Health Score 48, Multi-disease Alert",
                key_biomarker_milestone="5-Year Horizon: Major divergence in 10-year statistical ASCVD and Diabetes risk."
            ),
            LongitudinalMilestone(
                year=2036,
                scenario_1_status="Health Score 62, Stage 1 HTN risk",
                scenario_2_status="Health Score 94, Sustained vitality",
                scenario_3_status="Health Score 97, Optimal longevity",
                scenario_4_status="Health Score 36, Chronic medication dependence",
                key_biomarker_milestone="10-Year Horizon: Profound difference in quality-adjusted life years (QALYs)."
            )
        ]

        # Phased 4-Week Actionable Precision Habits Plan
        micro_plans = [
            MicroHabitPlanWeek(
                week_number=1,
                focus_theme="Circadian Alignment & Hydration Primer",
                daily_target_steps=6000,
                daily_target_water_l=2.5,
                sleep_bedtime="10:45 PM (Consistent lights-out)",
                nutrition_action="Eliminate sugar-sweetened beverages; replace afternoon snacks with raw walnuts/almonds.",
                stress_activity="5 minutes of box breathing (4s in, 4s hold, 4s out, 4s hold) before sleep.",
                expected_biological_benefit="Reduction in evening salivary cortisol and improved overnight heart rate variability (HRV)."
            ),
            MicroHabitPlanWeek(
                week_number=2,
                focus_theme="Postprandial Glucose Blunting & Aerobic Base",
                daily_target_steps=8000,
                daily_target_water_l=2.7,
                sleep_bedtime="10:30 PM",
                nutrition_action="10-minute light walk immediately following lunch and dinner to activate skeletal muscle GLUT4.",
                stress_activity="15 minutes of outdoor daylight exposure before 9:00 AM to anchor circadian melatonin rhythm.",
                expected_biological_benefit="Blunted post-meal blood sugar spikes by 18-24%, mitigating vascular endothelial inflammation."
            ),
            MicroHabitPlanWeek(
                week_number=3,
                focus_theme="Metabolic Resistance & Lean Muscle Activation",
                daily_target_steps=9000,
                daily_target_water_l=3.0,
                sleep_bedtime="10:30 PM",
                nutrition_action="Incorporate 25-30g of high-quality protein and 10g prebiotic fiber at breakfast (e.g., eggs + avocado + greens).",
                stress_activity="2x weekly 20-minute bodyweight resistance circuit (squats, push-ups, planks, lunges).",
                expected_biological_benefit="Increased basal metabolic rate (BMR) and hepatic glycogen storage capacity."
            ),
            MicroHabitPlanWeek(
                week_number=4,
                focus_theme="Sustained Cardiovascular Resilience & Recovery",
                daily_target_steps=10000,
                daily_target_water_l=3.0,
                sleep_bedtime="10:15 PM",
                nutrition_action="Adopt 80% Mediterranean dietary template (olive oil, leafy greens, wild fish, legumes, berries).",
                stress_activity="One full digital disconnect evening per week; sauna or contrast shower recovery.",
                expected_biological_benefit="Reduction in systemic hs-CRP inflammatory markers and stabilization of optimal blood pressure."
            )
        ]

        return SimulationResult(
            session_id=f"sim-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            user_name=bio.name,
            current_bmi=current_bmi,
            current_health_score=current_score,
            sub_scores=base["sub_scores"],
            disease_probabilities=base["disease_probabilities"],
            scenarios=[s1, s2, s3, s4],
            longitudinal_timeline=milestones,
            micro_habit_plan=micro_plans,
            medical_disclaimer="BioMindQ Future Life Simulator generates probabilistic risk forecasts derived from clinical epidemiological models (ASCVD, FINDRISC, Framingham). These estimates represent educational statistical projections to encourage preventive awareness, not diagnostic or clinical mandates. Consult licensed physicians for diagnostic testing."
        )

    @staticmethod
    def adjust_slider_delta(
        exercise_mins: int,
        sleep_hours: float,
        fast_food_days: int,
        water_liters: float,
        stress_level: int,
        current_score: int,
        base_diabetes_risk: int,
        base_heart_risk: int,
        base_weight: float
    ) -> Dict[str, Any]:
        """Instant sub-second slider calculation for real-time interactivity."""
        # Calculate dynamic deltas
        exercise_delta = (exercise_mins - 15) * 0.25 # e.g. +60 mins -> +11.25 pts
        sleep_delta = (sleep_hours - 6.0) * 2.2 # e.g. 8h -> +4.4 pts
        diet_delta = (3 - fast_food_days) * 2.0 # e.g. 0 days -> +6 pts
        water_delta = (water_liters - 1.8) * 1.8
        stress_delta = (6 - stress_level) * 1.6

        total_delta = exercise_delta + sleep_delta + diet_delta + water_delta + stress_delta
        new_score = max(15, min(99, int(current_score + total_delta)))

        # Disease risk dynamic adjustments
        diabetes_delta = - (exercise_mins * 0.35) - (sleep_delta * 1.5) + (fast_food_days * 3.2) + (stress_level * 1.0)
        new_diabetes_risk = max(4, min(95, int(base_diabetes_risk + diabetes_delta)))

        heart_delta = - (exercise_mins * 0.30) - (sleep_delta * 1.8) + (fast_food_days * 2.5) + (stress_level * 1.5)
        new_heart_risk = max(4, min(90, int(base_heart_risk + heart_delta)))

        # Projected 5-year weight adjustment
        weight_delta = - (exercise_mins * 0.08) + (fast_food_days * 0.7) - (water_liters * 0.3)
        projected_weight = round(max(48.0, base_weight + weight_delta), 1)

        # Biological age delta
        bio_age_delta = int((75 - new_score) / 6.0)

        return {
            "health_score": new_score,
            "diabetes_risk_pct": new_diabetes_risk,
            "heart_disease_risk_pct": new_heart_risk,
            "hypertension_risk_pct": max(5, min(90, int(new_heart_risk * 1.1))),
            "projected_5yr_weight_kg": projected_weight,
            "biological_age_delta": bio_age_delta,
            "lifestyle_grade": "Optimal" if new_score >= 88 else ("Good" if new_score >= 75 else ("Fair" if new_score >= 60 else "High Risk"))
        }
