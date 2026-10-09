import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Activity,
  Heart,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sliders,
  Upload,
  FileText,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  Droplets,
  Moon,
  Utensils,
  Brain,
  Scale,
  RefreshCw,
  Plus,
  X,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  Check
} from 'lucide-react';
import type {
  UserBiomarkersState,
  LifestyleHabitsState,
  SimulationResult,
  SliderDeltaResult
} from '../types';
import { api } from '../services/api';

interface FutureLifeSimulatorPageProps {
  onStartResearch?: (query: string) => void;
  onNavigateToResearch?: (query: string) => void;
}

export const FutureLifeSimulatorPage: React.FC<FutureLifeSimulatorPageProps> = ({
  onStartResearch,
  onNavigateToResearch
}) => {
  const roundNum = (n: number) => Math.round(n * 10) / 10;

  // User Biomarkers State
  const [biomarkers, setBiomarkers] = useState<UserBiomarkersState>({
    name: "Mohammed",
    age: 34,
    gender: "male",
    height_cm: 175,
    weight_kg: 82,
    blood_group: "O+",
    fasting_glucose_mg_dl: 118,
    hba1c_pct: 6.2,
    total_cholesterol_mg_dl: 215,
    ldl_cholesterol_mg_dl: 145,
    hdl_cholesterol_mg_dl: 42,
    triglycerides_mg_dl: 190,
    systolic_bp: 132,
    diastolic_bp: 84,
    alt_u_l: 48,
    ast_u_l: 36,
    egfr_ml_min: 98,
    creatinine_mg_dl: 0.95,
    tsh_uiu_ml: 2.1,
    family_history_diabetes: true,
    family_history_heart_disease: true
  });

  // Lifestyle Habits State
  const [habits, setHabits] = useState<LifestyleHabitsState>({
    sleep_hours: 6.0,
    exercise_minutes_per_day: 15,
    exercise_days_per_week: 2,
    daily_water_liters: 1.8,
    fast_food_meals_per_week: 4,
    stress_level_1_to_10: 7,
    smoking_status: "never",
    alcohol_drinks_per_week: 2,
    screen_time_hours_per_day: 8.5,
    working_hours_per_day: 9.0
  });

  // Interactive Live Slider State
  const [sliderExercise, setSliderExercise] = useState<number>(30);
  const [sliderSleep, setSliderSleep] = useState<number>(7.5);
  const [sliderWater, setSliderWater] = useState<number>(2.5);
  const [sliderFastFood, setSliderFastFood] = useState<number>(1);
  const [sliderStress, setSliderStress] = useState<number>(4);

  // Dynamic Slider Calculated Deltas
  const [sliderResult, setSliderResult] = useState<SliderDeltaResult | null>(null);

  // Full Simulation Output
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'slider' | 'timeline' | 'disease_risk' | 'habits_plan'>('scenarios');
  const [timeHorizon, setTimeHorizon] = useState<'1yr' | '3yr' | '5yr' | '10yr'>('5yr');
  const [customGoalWeightLoss, setCustomGoalWeightLoss] = useState<number>(6);
  const [customGoalExerciseMin, setCustomGoalExerciseMin] = useState<number>(35);
  const [customGoalSleepHours, setCustomGoalSleepHours] = useState<number>(7.5);

  // OCR Modal
  const [isOCRModalOpen, setIsOCRModalOpen] = useState<boolean>(false);
  const [ocrReportText, setOcrReportText] = useState<string>('');
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);

  // Persona Presets
  const applyPreset = (preset: 'prediabetic' | 'athlete' | 'executive') => {
    let newBio = { ...biomarkers };
    let newHabits = { ...habits };
    if (preset === 'prediabetic') {
      newBio = {
        ...biomarkers,
        name: "Mohammed A. (Pre-diabetic Profile)",
        age: 34,
        weight_kg: 83.5,
        fasting_glucose_mg_dl: 135,
        hba1c_pct: 6.4,
        ldl_cholesterol_mg_dl: 170,
        hdl_cholesterol_mg_dl: 38,
        systolic_bp: 138,
        diastolic_bp: 88,
        alt_u_l: 52
      };
      newHabits = {
        ...habits,
        sleep_hours: 5.5,
        exercise_minutes_per_day: 10,
        fast_food_meals_per_week: 5,
        stress_level_1_to_10: 8
      };
    } else if (preset === 'athlete') {
      newBio = {
        ...biomarkers,
        name: "Sara K. (Active Athlete)",
        age: 29,
        weight_kg: 62,
        height_cm: 168,
        fasting_glucose_mg_dl: 86,
        hba1c_pct: 5.1,
        ldl_cholesterol_mg_dl: 92,
        hdl_cholesterol_mg_dl: 68,
        systolic_bp: 112,
        diastolic_bp: 72,
        alt_u_l: 22
      };
      newHabits = {
        ...habits,
        sleep_hours: 8.0,
        exercise_minutes_per_day: 50,
        exercise_days_per_week: 5,
        daily_water_liters: 3.2,
        fast_food_meals_per_week: 0,
        stress_level_1_to_10: 3
      };
    } else {
      newBio = {
        ...biomarkers,
        name: "Alex R. (High-Stress Executive)",
        age: 42,
        weight_kg: 88,
        fasting_glucose_mg_dl: 112,
        hba1c_pct: 5.8,
        ldl_cholesterol_mg_dl: 158,
        systolic_bp: 142,
        diastolic_bp: 92,
        alt_u_l: 44
      };
      newHabits = {
        ...habits,
        sleep_hours: 5.0,
        exercise_minutes_per_day: 5,
        fast_food_meals_per_week: 6,
        stress_level_1_to_10: 9
      };
    }
    setBiomarkers(newBio);
    setHabits(newHabits);
    runFullSimulation(newBio, newHabits);
  };

  // Run Simulation on Mount and on Biomarkers/Habits update
  const runFullSimulation = async (bioOverride?: UserBiomarkersState, habitsOverride?: LifestyleHabitsState) => {
    setIsLoading(true);
    const activeBio = bioOverride || biomarkers;
    const activeHabits = habitsOverride || habits;
    try {
      const res = await api.runSimulation({
        biomarkers: activeBio,
        lifestyle_habits: activeHabits
      });
      setSimResult(res);
      // Initialize slider result
      recalculateSliderDelta(
        sliderExercise,
        sliderSleep,
        sliderWater,
        sliderFastFood,
        sliderStress,
        res.current_health_score,
        res.disease_probabilities.type_2_diabetes,
        res.disease_probabilities.cardiovascular_disease,
        activeBio.weight_kg
      );
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const recalculateSliderDelta = async (ex: number, sl: number, wt: number, ff: number, st: number, curScore?: number, baseDiab?: number, baseHeart?: number, baseWt?: number) => {
    const score = curScore || (simResult?.current_health_score || 76);
    const diab = baseDiab || (simResult?.disease_probabilities.type_2_diabetes || 32);
    const heart = baseHeart || (simResult?.disease_probabilities.cardiovascular_disease || 22);
    const weight = baseWt || biomarkers.weight_kg;

    const delta = await api.adjustHabitSlider({
      exercise_minutes_per_day: ex,
      sleep_hours: sl,
      fast_food_meals_per_week: ff,
      daily_water_liters: wt,
      stress_level_1_to_10: st,
      current_health_score: score,
      base_diabetes_risk_pct: diab,
      base_heart_risk_pct: heart,
      base_weight_kg: weight
    });
    setSliderResult(delta);
  };

  useEffect(() => {
    runFullSimulation();
  }, []);

  // Update slider delta when sliders change
  const handleSliderChange = (type: 'exercise' | 'sleep' | 'water' | 'fast_food' | 'stress', value: number) => {
    let newEx = sliderExercise;
    let newSl = sliderSleep;
    let newWt = sliderWater;
    let newFf = sliderFastFood;
    let newSt = sliderStress;

    if (type === 'exercise') { newEx = value; setSliderExercise(value); }
    if (type === 'sleep') { newSl = value; setSliderSleep(value); }
    if (type === 'water') { newWt = value; setSliderWater(value); }
    if (type === 'fast_food') { newFf = value; setSliderFastFood(value); }
    if (type === 'stress') { newSt = value; setSliderStress(value); }

    recalculateSliderDelta(newEx, newSl, newWt, newFf, newSt);
  };

  // Handle OCR Parse
  const handleOCRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocrReportText.trim()) return;
    try {
      const res = await api.parseMedicalReport(ocrReportText);
      if (res.success && res.biomarkers) {
        setBiomarkers(prev => ({
          ...prev,
          ...res.biomarkers
        }));
        setOcrSuccessMsg(`Extracted ${res.extracted_count} lab values from report!`);
        setTimeout(() => {
          setOcrSuccessMsg(null);
          setIsOCRModalOpen(false);
          runFullSimulation();
        }, 1500);
      }
    } catch (err) {
      console.error('OCR parse error:', err);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#002B2E] via-[#004D53] to-[#0A6B70] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#00E5D4] text-xs font-bold tracking-wider uppercase border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Future Life Simulator · Preventive Healthcare Engine</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Predicting Your Health Over 1, 3, 5, and 10 Years
          </h1>
          
          <p className="text-xs sm:text-sm text-[#C8E8E6] leading-relaxed">
            Shifting healthcare from reactive treatment to predictive prevention. BioMindQ simulates multiple future health trajectories by synthesizing your lab biomarkers, lifestyle habits, and metabolic models.
          </p>

          {/* Quick Persona Action Bar */}
          <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#A1D4D2] font-semibold text-[11px]">Quick Load Demo Profile:</span>
            <button
              onClick={() => applyPreset('prediabetic')}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-white font-medium border border-white/20 transition-all cursor-pointer"
            >
              🩺 Pre-Diabetic (34yo)
            </button>
            <button
              onClick={() => applyPreset('athlete')}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-white font-medium border border-white/20 transition-all cursor-pointer"
            >
              🏃 Active Athlete (29yo)
            </button>
            <button
              onClick={() => applyPreset('executive')}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-white font-medium border border-white/20 transition-all cursor-pointer"
            >
              💼 High-Stress Exec (42yo)
            </button>
            <button
              onClick={() => setIsOCRModalOpen(true)}
              className="ml-auto px-3 py-1 bg-[#00D1C1] hover:bg-[#00B8A9] text-[#002B2E] font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Medical Report (OCR)</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Health Score & 6 Sub-Scores Grid */}
      {simResult && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Current Score Gauge */}
          <div className="bg-white border border-[#D8E6E4] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00606B]">
                Current Health Score
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-4xl font-extrabold text-[#0F2E33]">
                  {simResult.current_health_score}
                </span>
                <span className="text-sm font-semibold text-[#738B8E]">/ 100</span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#55696C]">
                <span>Status</span>
                <span className="font-bold text-[#00606B]">
                  {simResult.current_health_score >= 80 ? 'Optimal Reserve' : simResult.current_health_score >= 65 ? 'Moderate Risk Band' : 'Early Intervention Needed'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E8F2F1] rounded-full overflow-hidden">
                <div
                  style={{ width: `${simResult.current_health_score}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 via-[#008A90] to-emerald-500 rounded-full"
                />
              </div>
              <p className="text-[11px] text-[#7A9396]">
                BMI: <strong>{simResult.current_bmi}</strong> ({simResult.current_bmi >= 25 ? 'Overweight' : 'Normal'})
              </p>
            </div>
          </div>

          {/* 6 Sub-Scores Grid */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Heart Health', score: simResult.sub_scores.heart_health, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
              { label: 'Diabetes Protection', score: simResult.sub_scores.diabetes_protection, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
              { label: 'Fitness Index', score: simResult.sub_scores.fitness, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
              { label: 'Mental Wellness', score: simResult.sub_scores.mental_wellness, icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
              { label: 'Sleep Quality', score: simResult.sub_scores.sleep_quality, icon: Moon, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
              { label: 'Nutrition Score', score: simResult.sub_scores.nutrition, icon: Utensils, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' }
            ].map((sub, idx) => {
              const Icon = sub.icon;
              return (
                <div key={idx} className={`rounded-xl border p-3.5 flex flex-col justify-between space-y-2 ${sub.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-[#334648] truncate">{sub.label}</span>
                    <Icon className={`w-3.5 h-3.5 ${sub.color}`} />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-[#0F2E33]">{sub.score}%</span>
                    <div className="w-full h-1.5 bg-black/10 rounded-full mt-1.5 overflow-hidden">
                      <div style={{ width: `${sub.score}%` }} className={`h-full ${sub.color.replace('text', 'bg')}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Feature Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#D8E6E4] pb-2 text-xs sm:text-sm font-semibold overflow-x-auto">
        {[
          { id: 'scenarios', label: '⭐ 4 Future Scenarios Side-by-Side' },
          { id: 'slider', label: '⭐⭐⭐⭐⭐ Interactive Habit Slider (Live Delta)' },
          { id: 'timeline', label: 'Longitudinal Future Timeline (2026–2036)' },
          { id: 'disease_risk', label: 'Disease Probability Dashboard' },
          { id: 'habits_plan', label: '4-Week Actionable Micro-Plan' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#00606B] text-white shadow-xs font-bold'
                : 'text-[#55696C] hover:bg-[#E5F5F3] hover:text-[#0F2E33]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: 4 Future Scenarios Side-by-Side Grid + Horizon Switcher + Customizer ⭐ */}
      {activeTab === 'scenarios' && simResult && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="bg-white border border-[#D8E6E4] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0F2E33]">
                  Future Versions of You (Multi-Horizon Projections)
                </h2>
                <p className="text-xs text-[#55696C]">
                  Select a simulation horizon to project your health score, weight, and disease probabilities across different lifestyles.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => runFullSimulation()}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-[#CDECE8] text-[#00606B] hover:bg-[#EBF7F6] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Recalculate</span>
                </button>
              </div>
            </div>

            {/* Horizon Switcher Pills */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00606B]" />
                Simulation Horizon:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: '1yr', label: '1 Year' },
                  { id: '3yr', label: '3 Years' },
                  { id: '5yr', label: '5 Years (Standard)' },
                  { id: '10yr', label: '10 Years' }
                ].map((hz) => (
                  <button
                    key={hz.id}
                    onClick={() => setTimeHorizon(hz.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      timeHorizon === hz.id
                        ? 'bg-[#00606B] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {hz.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4 Standard Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {simResult.scenarios.map((scen) => {
              const scoreToShow =
                timeHorizon === '1yr'
                  ? scen.health_score_1yr
                  : timeHorizon === '3yr'
                  ? scen.health_score_3yr
                  : timeHorizon === '10yr'
                  ? scen.health_score_10yr
                  : scen.health_score_5yr;

              const weightToShow =
                timeHorizon === '1yr'
                  ? roundNum(biomarkers.weight_kg + (scen.weight_5yr_kg - biomarkers.weight_kg) * 0.25)
                  : timeHorizon === '3yr'
                  ? roundNum(biomarkers.weight_kg + (scen.weight_5yr_kg - biomarkers.weight_kg) * 0.65)
                  : timeHorizon === '10yr'
                  ? roundNum(biomarkers.weight_kg + (scen.weight_5yr_kg - biomarkers.weight_kg) * 1.5)
                  : scen.weight_5yr_kg;

              return (
                <div
                  key={scen.id}
                  className="bg-white border-2 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                  style={{ borderColor: scen.color }}
                >
                  {/* Scenario Header */}
                  <div className="space-y-1.5 pb-3 border-b border-[#E8EEEE]">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase" style={{ backgroundColor: scen.color }}>
                        {scen.id.replace('scenario-', '').toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-[#0F2E33]">{timeHorizon.toUpperCase()} Horizon</span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F2E33] leading-snug">
                      {scen.title}
                    </h3>
                    <p className="text-[11.5px] text-[#55696C] leading-relaxed">
                      {scen.subtitle}
                    </p>
                  </div>

                  {/* Score & Weight Metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-[#F6FBFA] p-3 rounded-xl border border-[#E2EEEC] text-xs">
                    <div>
                      <span className="text-[#65797C] text-[10.5px]">Health Score</span>
                      <div className="text-2xl font-black" style={{ color: scen.color }}>
                        {scoreToShow}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#65797C] text-[10.5px]">Projected Wt</span>
                      <div className="text-xl font-bold text-[#0F2E33]">
                        {weightToShow} kg
                      </div>
                    </div>
                  </div>

                  {/* Disease Probabilities Breakdown */}
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7D80] block">
                      Estimated Disease Risks ({timeHorizon})
                    </span>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#55696C]">Type 2 Diabetes</span>
                        <span className="font-bold text-[#0F2E33]">{scen.diabetes_risk_5yr_pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E8EEEE] rounded-full overflow-hidden">
                        <div style={{ width: `${scen.diabetes_risk_5yr_pct}%`, backgroundColor: scen.color }} className="h-full rounded-full" />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[#55696C]">Heart Disease</span>
                        <span className="font-bold text-[#0F2E33]">{scen.heart_disease_risk_5yr_pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E8EEEE] rounded-full overflow-hidden">
                        <div style={{ width: `${scen.heart_disease_risk_5yr_pct}%`, backgroundColor: scen.color }} className="h-full rounded-full" />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[#55696C]">Hypertension</span>
                        <span className="font-bold text-[#0F2E33]">{scen.hypertension_risk_5yr_pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E8EEEE] rounded-full overflow-hidden">
                        <div style={{ width: `${scen.hypertension_risk_5yr_pct}%`, backgroundColor: scen.color }} className="h-full rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Key Outcomes List */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E8EEEE] text-[11px] text-[#4A5D60]">
                    <span className="font-bold text-[#0F2E33] block">Projected Outcomes:</span>
                    <ul className="space-y-1">
                      {scen.key_projected_outcomes.slice(0, 2).map((ko, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#00606B] font-bold">•</span>
                          <span>{ko}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scenario 5: Interactive Custom Target Scenario Builder */}
          <div className="bg-gradient-to-br from-[#002B2E] to-[#043F44] text-white rounded-2xl p-6 shadow-md border border-[#0A4E54] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#00D1C1] text-[#002B2E] uppercase">
                  Scenario 5 (Customizable)
                </span>
                <h3 className="text-base font-bold text-white">
                  Your Custom Goal Target Future Version
                </h3>
              </div>
              <span className="text-xs text-[#00D1C1] font-semibold">
                Live Interactive Goal Tuning
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Custom Sliders */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Target Weight Loss:</span>
                    <span className="text-[#00D1C1] font-bold">-{customGoalWeightLoss} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={customGoalWeightLoss}
                    onChange={(e) => setCustomGoalWeightLoss(Number(e.target.value))}
                    className="w-full accent-[#00D1C1]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 kg</span>
                    <span>-10 kg</span>
                    <span>-20 kg</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Daily Exercise:</span>
                    <span className="text-[#00D1C1] font-bold">{customGoalExerciseMin} mins/day</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={customGoalExerciseMin}
                    onChange={(e) => setCustomGoalExerciseMin(Number(e.target.value))}
                    className="w-full accent-[#00D1C1]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 min</span>
                    <span>45 min</span>
                    <span>90 min</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Target Sleep:</span>
                    <span className="text-[#00D1C1] font-bold">{customGoalSleepHours} hrs/night</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="9"
                    step="0.5"
                    value={customGoalSleepHours}
                    onChange={(e) => setCustomGoalSleepHours(Number(e.target.value))}
                    className="w-full accent-[#00D1C1]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5.0 h</span>
                    <span>7.5 h</span>
                    <span>9.0 h</span>
                  </div>
                </div>
              </div>

              {/* Calculated Projected Target Metrics */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <span className="text-[11px] font-bold text-[#A3C6C6] uppercase tracking-wider">
                  Custom Projected Health Score
                </span>
                <div>
                  <div className="text-4xl font-extrabold text-[#00D1C1]">
                    {Math.min(99, Math.max(30, (simResult.current_health_score || 76) + Math.round(customGoalWeightLoss * 1.5) + Math.round(customGoalExerciseMin * 0.25) + Math.round((customGoalSleepHours - 6) * 3)))}
                    <span className="text-lg font-normal text-slate-300"> / 100</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Target Weight: <strong className="text-white">{Math.max(45, biomarkers.weight_kg - customGoalWeightLoss)} kg</strong> (from {biomarkers.weight_kg} kg)
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 text-[11px] text-[#00D1C1]">
                  Estimated Biological Age: -{Math.min(8, Math.round(customGoalWeightLoss * 0.4 + customGoalExerciseMin * 0.08))} years younger
                </div>
              </div>

              {/* Calculated Disease Risk Reductions */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-[#A3C6C6] uppercase tracking-wider block">
                  Projected Risk Reductions
                </span>
                <div className="space-y-1.5 text-[11.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Type 2 Diabetes Risk:</span>
                    <span className="font-bold text-emerald-400">
                      {Math.max(4, Math.round((simResult.disease_probabilities.type_2_diabetes || 32) - customGoalWeightLoss * 2.2 - customGoalExerciseMin * 0.2))}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Cardiovascular Risk:</span>
                    <span className="font-bold text-emerald-400">
                      {Math.max(4, Math.round((simResult.disease_probabilities.cardiovascular_disease || 22) - customGoalExerciseMin * 0.25 - customGoalWeightLoss * 1.2))}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Hypertension Risk:</span>
                    <span className="font-bold text-emerald-400">
                      {Math.max(5, Math.round((simResult.disease_probabilities.hypertension || 18) - (customGoalSleepHours - 6) * 4 - customGoalExerciseMin * 0.15))}%
                    </span>
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-400 pt-2 border-t border-white/10">
                  Custom targets update dynamically as you drag the sliders above.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Future Habit Slider ⭐⭐⭐⭐⭐ (Jury Impressive Feature) */}
      {activeTab === 'slider' && sliderResult && (
        <div className="bg-white border border-[#D8E6E4] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E5F5F3] text-[#00606B] text-[11px] font-bold uppercase">
                <Sliders className="w-3.5 h-3.5" />
                <span>Interactive Future Health Predictor</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F2E33]">
                Adjust Habits in Real-Time & See Your Future Risk Shift
              </h2>
              <p className="text-xs text-[#55696C]">
                Move the sliders below to simulate how increasing exercise, sleep, or nutrition immediately bends your future disease curves.
              </p>
            </div>

            {/* Dynamic Result Score Pill */}
            <div className="bg-gradient-to-br from-[#002B2E] to-[#00606B] text-white p-4 rounded-2xl text-center min-w-[180px] shadow-sm">
              <span className="text-[10.5px] uppercase tracking-wider text-[#A1D4D2] font-semibold">
                Adjusted Health Score
              </span>
              <div className="text-4xl font-extrabold text-white pt-0.5">
                {sliderResult.health_score}
                <span className="text-sm font-normal text-[#A1D4D2]"> / 100</span>
              </div>
              <div className="text-xs font-semibold text-[#00E5D4] mt-1">
                Grade: {sliderResult.lifestyle_grade}
              </div>
            </div>
          </div>

          {/* 5 Interactive Sliders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Slider 1: Exercise Minutes */}
            <div className="bg-[#F8FCFB] border border-[#DDECE9] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F2E33] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#00606B]" />
                  <span>Daily Exercise Duration</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#00606B] text-white font-bold text-xs">
                  {sliderExercise} Minutes / day
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={sliderExercise}
                onChange={(e) => handleSliderChange('exercise', parseInt(e.target.value))}
                className="w-full accent-[#00606B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7A9396]">
                <span>0 min (Sedentary)</span>
                <span>30 min (Recommended)</span>
                <span>60 min (Athletic)</span>
                <span>90 min</span>
              </div>
            </div>

            {/* Slider 2: Sleep Duration */}
            <div className="bg-[#F8FCFB] border border-[#DDECE9] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F2E33] flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span>Overnight Sleep Duration</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-blue-700 text-white font-bold text-xs">
                  {sliderSleep} Hours / night
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={10}
                step={0.5}
                value={sliderSleep}
                onChange={(e) => handleSliderChange('sleep', parseFloat(e.target.value))}
                className="w-full accent-blue-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7A9396]">
                <span>4h (Severe Deprivation)</span>
                <span>7h (Optimal Baseline)</span>
                <span>8h (Peak Recovery)</span>
                <span>10h</span>
              </div>
            </div>

            {/* Slider 3: Fast Food Frequency */}
            <div className="bg-[#F8FCFB] border border-[#DDECE9] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F2E33] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  <span>Ultra-Processed / Fast Food Meals</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-700 text-white font-bold text-xs">
                  {sliderFastFood} Meals / week
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={7}
                step={1}
                value={sliderFastFood}
                onChange={(e) => handleSliderChange('fast_food', parseInt(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7A9396]">
                <span>0 meals (Whole Food Clean)</span>
                <span>2 meals</span>
                <span>4 meals</span>
                <span>7 meals (Daily)</span>
              </div>
            </div>

            {/* Slider 4: Water Hydration */}
            <div className="bg-[#F8FCFB] border border-[#DDECE9] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F2E33] flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <span>Daily Water Hydration</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-cyan-700 text-white font-bold text-xs">
                  {sliderWater} Liters / day
                </span>
              </div>
              <input
                type="range"
                min={1.0}
                max={4.0}
                step={0.2}
                value={sliderWater}
                onChange={(e) => handleSliderChange('water', parseFloat(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7A9396]">
                <span>1.0 L</span>
                <span>2.0 L</span>
                <span>3.0 L (Optimal)</span>
                <span>4.0 L</span>
              </div>
            </div>

            {/* Slider 5: Daily Stress Level */}
            <div className="lg:col-span-2 bg-[#F8FCFB] border border-[#DDECE9] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F2E33] flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span>Perceived Stress Level (1-10 Scale)</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-purple-700 text-white font-bold text-xs">
                  Level {sliderStress} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={sliderStress}
                onChange={(e) => handleSliderChange('stress', parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7A9396]">
                <span>1 (Calm & Meditative)</span>
                <span>4 (Normal Working Day)</span>
                <span>7 (Elevated Stress)</span>
                <span>10 (Severe Chronic Burnout)</span>
              </div>
            </div>
          </div>

          {/* Real-Time Shift Results Bar */}
          <div className="bg-[#EBF7F5] border border-[#C2E8E4] rounded-2xl p-5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00606B] block">
              Estimated Future Risk Shift Based on Your Sliders
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-3 rounded-xl border border-[#D0ECE8] space-y-1">
                <span className="text-[11px] text-[#55696C]">Type 2 Diabetes Risk</span>
                <div className="text-2xl font-black text-[#0F2E33]">
                  {sliderResult.diabetes_risk_pct}%
                </div>
                <span className="text-[10px] font-bold text-emerald-600">
                  {sliderResult.diabetes_risk_pct < 20 ? '↓ Low Risk' : '↑ Elevated'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#D0ECE8] space-y-1">
                <span className="text-[11px] text-[#55696C]">Heart Disease Risk</span>
                <div className="text-2xl font-black text-[#0F2E33]">
                  {sliderResult.heart_disease_risk_pct}%
                </div>
                <span className="text-[10px] font-bold text-emerald-600">
                  {sliderResult.heart_disease_risk_pct < 15 ? '↓ Optimal' : '↑ Moderate'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#D0ECE8] space-y-1">
                <span className="text-[11px] text-[#55696C]">Projected 5-Yr Weight</span>
                <div className="text-2xl font-black text-[#0F2E33]">
                  {sliderResult.projected_5yr_weight_kg} kg
                </div>
                <span className="text-[10px] font-bold text-[#00606B]">
                  {sliderResult.projected_5yr_weight_kg < biomarkers.weight_kg ? '↓ Fat Loss Trend' : '↑ Weight Gain'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#D0ECE8] space-y-1">
                <span className="text-[11px] text-[#55696C]">Biological Age Shift</span>
                <div className="text-2xl font-black text-[#00606B]">
                  {sliderResult.biological_age_delta > 0 ? `+${sliderResult.biological_age_delta}` : sliderResult.biological_age_delta} Yrs
                </div>
                <span className="text-[10px] font-bold text-[#00606B]">
                  {sliderResult.biological_age_delta <= 0 ? 'Youthful Reserve' : 'Accelerated Aging'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Longitudinal Future Timeline (2026 - 2036) */}
      {activeTab === 'timeline' && simResult && (
        <div className="bg-white border border-[#D8E6E4] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#0F2E33]">
              10-Year Longitudinal Health Milestone Trajectory (2026 – 2036)
            </h2>
            <p className="text-xs text-[#55696C]">
              How biomarker separation unfolds across 1, 2, 5, and 10 years depending on selected scenario.
            </p>
          </div>

          <div className="space-y-4">
            {simResult.longitudinal_timeline.map((m, idx) => (
              <div key={idx} className="bg-[#F8FCFB] border border-[#DDECE9] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 bg-[#00606B] text-white font-extrabold text-xs rounded-lg shadow-xs">
                      Year {m.year}
                    </span>
                    <span className="text-xs font-semibold text-[#0F2E33]">
                      {m.key_biomarker_milestone}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7A9396] font-medium hidden sm:block">
                    Longitudinal Horizon
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-[#E0ECEB] space-y-0.5">
                    <span className="text-[10px] font-bold text-[#00606B]">Scenario 1 (Current)</span>
                    <p className="text-[#334648] font-medium">{m.scenario_1_status}</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-800">Scenario 2 (Exercise)</span>
                    <p className="text-emerald-900 font-medium">{m.scenario_2_status}</p>
                  </div>
                  <div className="p-2.5 bg-teal-50 rounded-lg border border-teal-200 space-y-0.5">
                    <span className="text-[10px] font-bold text-teal-800">Scenario 3 (Weight Loss)</span>
                    <p className="text-teal-900 font-medium">{m.scenario_3_status}</p>
                  </div>
                  <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 space-y-0.5">
                    <span className="text-[10px] font-bold text-rose-800">Scenario 4 (Worst-Case)</span>
                    <p className="text-rose-900 font-medium">{m.scenario_4_status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Disease Probability Dashboard */}
      {activeTab === 'disease_risk' && simResult && (
        <div className="bg-white border border-[#D8E6E4] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#0F2E33]">
              10-Year Estimated Disease Probability Dashboard
            </h2>
            <p className="text-xs text-[#55696C]">
              Derived from multi-variable clinical equations (ASCVD Risk Estimator, FINDRISC Type 2 Diabetes Score).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Type 2 Diabetes Mellitus', risk: simResult.disease_probabilities.type_2_diabetes, desc: 'Calculated from fasting glucose, HbA1c, BMI, and physical activity markers.', tag: 'Metabolic' },
              { name: 'Atherosclerotic CVD (Heart)', risk: simResult.disease_probabilities.cardiovascular_disease, desc: 'Calculated from systolic blood pressure, LDL/HDL ratio, and arterial stiffness.', tag: 'Cardiovascular' },
              { name: 'Essential Hypertension', risk: simResult.disease_probabilities.hypertension, desc: 'Estimates progression to Stage 1/2 persistent blood pressure elevation.', tag: 'Vascular' },
              { name: 'Fatty Liver Disease (NAFLD)', risk: simResult.disease_probabilities.fatty_liver_disease, desc: 'Correlates visceral adipose, ALT transaminase, and fast-food frequency.', tag: 'Hepatic' },
              { name: 'Chronic Kidney Disease', risk: simResult.disease_probabilities.chronic_kidney_disease, desc: 'Evaluates eGFR filtration and microvascular renal perfusion.', tag: 'Renal' }
            ].map((d, i) => (
              <div key={i} className="bg-[#F8FCFB] border border-[#DDECE9] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#E5F5F3] text-[#00606B] font-bold text-[10px] rounded">
                    {d.tag}
                  </span>
                  <span className="text-xl font-extrabold text-[#0F2E33]">{d.risk}%</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F2E33]">{d.name}</h3>
                  <p className="text-[11.5px] text-[#55696C] mt-1 leading-relaxed">{d.desc}</p>
                </div>
                <div className="w-full h-2 bg-[#E2EEEC] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${d.risk}%` }}
                    className={`h-full rounded-full ${d.risk > 35 ? 'bg-amber-500' : d.risk > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Phased 4-Week Actionable Micro-Habit Plan */}
      {activeTab === 'habits_plan' && simResult && (
        <div className="bg-white border border-[#D8E6E4] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#0F2E33]">
              Personalized Phased 4-Week Micro-Habits Roadmap
            </h2>
            <p className="text-xs text-[#55696C]">
              Instead of generic advice like "eat healthy", BioMindQ generates structured, evidence-backed weekly micro-actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simResult.micro_habit_plan.map((wk) => (
              <div key={wk.week_number} className="bg-[#F8FCFB] border border-[#DDECE9] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E0ECEB]">
                  <span className="px-3 py-1 bg-[#00606B] text-white font-bold text-xs rounded-lg">
                    Week {wk.week_number}
                  </span>
                  <span className="text-xs font-bold text-[#0F2E33]">{wk.focus_theme}</span>
                </div>

                <div className="space-y-2 text-xs text-[#334648]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#65797C]">Daily Step Target:</span>
                    <span className="font-bold text-[#00606B]">{wk.daily_target_steps.toLocaleString()} Steps</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#65797C]">Target Hydration:</span>
                    <span className="font-bold text-cyan-700">{wk.daily_target_water_l} L / day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#65797C]">Sleep Window:</span>
                    <span className="font-bold text-blue-700">{wk.sleep_bedtime}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-[#EAEFEF] space-y-1">
                    <span className="font-bold text-[#0F2E33] block">Precision Nutrition Action:</span>
                    <p className="text-[11.5px] text-[#4A5D60]">{wk.nutrition_action}</p>
                  </div>

                  <div className="pt-1 space-y-1">
                    <span className="font-bold text-[#0F2E33] block">Stress Regulation:</span>
                    <p className="text-[11.5px] text-[#4A5D60]">{wk.stress_activity}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#E5F5F3] text-[11px] text-[#00606B] font-medium border border-[#C2E8E4]">
                    <strong>Expected Benefit:</strong> {wk.expected_biological_benefit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Report OCR Modal */}
      {isOCRModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E8E3]">
              <div className="flex items-center gap-2 text-[#00606B] font-bold text-sm">
                <Upload className="w-4 h-4" />
                <span>Medical Lab Report OCR & Value Extractor</span>
              </div>
              <button
                onClick={() => setIsOCRModalOpen(false)}
                className="p-1 text-[#737873] hover:text-[#202522] rounded hover:bg-[#F4F6F6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {ocrSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{ocrSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleOCRSubmit} className="space-y-4 text-xs">
                <p className="text-[#55696C]">
                  Paste text from your diagnostic lab report (CBC, Lipid Panel, Blood Sugar, HbA1c, Liver Function, Kidney Function) or load sample clinical text:
                </p>

                <textarea
                  rows={6}
                  value={ocrReportText}
                  onChange={(e) => setOcrReportText(e.target.value)}
                  placeholder="Paste report text here (e.g. Fasting Glucose: 135 mg/dL, HbA1c: 6.4%, LDL: 170 mg/dL, Blood Pressure: 138/88 mmHg)..."
                  className="w-full p-3 rounded-xl border border-[#D5E1DE] bg-[#F7FAFA] text-[#1C2826] focus:outline-none focus:ring-1 focus:ring-[#00606B]"
                />

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setOcrReportText(`DIAGNOSTIC COMPREHENSIVE METABOLIC REPORT\nPatient: Mohammed A. Age: 34\nFasting Blood Glucose: 135 mg/dL\nHbA1c: 6.4 %\nTotal Cholesterol: 225 mg/dL\nLDL Cholesterol: 170 mg/dL\nHDL Cholesterol: 38 mg/dL\nTriglycerides: 210 mg/dL\nBlood Pressure: 138/88 mmHg\nSGPT (ALT): 48 U/L\nCreatinine: 0.98 mg/dL\neGFR: 98 mL/min`)}
                    className="text-[#00606B] hover:underline font-semibold text-[11px]"
                  >
                    Insert Sample Lab Report Text
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#00606B] hover:bg-[#004D53] text-white font-bold transition-colors"
                  >
                    Extract Values & Simulate
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
