export type EvidenceType = 'Clinical' | 'Preclinical' | 'Mechanism' | 'Review' | 'Meta-Analysis' | 'All';

export type AgreementStatus = 'Mostly Consistent' | 'Mixed Evidence' | 'Conflicting Evidence' | 'Insufficient Evidence';

export type SourceType = 'PubMed' | 'ChEMBL' | 'ClinicalTrials.gov' | 'DrugBank' | 'Europe PMC';

export type TrialStatus = 'Recruiting' | 'Active, not recruiting' | 'Completed' | 'Terminated' | 'Withdrawn' | 'Unknown';

export interface CitationItem {
  id: string;
  marker: string; // e.g., "[1]"
  title: string;
  authors: string[];
  journal?: string;
  publication_date?: string;
  year?: number;
  pmid?: string;
  doi?: string;
  source_id?: string;
  source_type: string;
  source_name?: string;
  source_url: string;
  study_type: string;
  institution?: string;
  evidence_excerpt: string;
  abstract?: string;
  relevance_score: number;
  why_it_matters: string;
  retrieval_timestamp: string;
}

export interface ConflictRecord {
  id: string;
  topic: string;
  finding_a: string;
  source_a: string;
  finding_b: string;
  source_b: string;
  possible_explanation: string;
  clinical_significance: string;
}

export interface EvidenceClaim {
  id: string;
  claim: string;
  category: string;
  supporting_citations: string[];
  opposing_citations: string[];
  confidence_score: number;
  agreement_status: AgreementStatus;
  scientific_context: string;
}

export interface GraphNode {
  id: string;
  type: string;
  data: {
    label: string;
    category?: string;
    color?: string;
    description?: string;
    smiles?: string;
    mw?: number;
    chembl_id?: string;
    journal?: string;
    year?: number;
    pmid?: string;
    doi?: string;
    status?: string;
    sponsor?: string;
    source_url?: string;
    [key: string]: any;
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ResearchTimelineEvent {
  id: string;
  year: number;
  date_str: string;
  title: string;
  event_type: string;
  summary: string;
  citation_marker?: string;
  source_name: string;
  source_url?: string;
  pmid?: string;
}

export interface CompoundDetail {
  id: string;
  name: string;
  chembl_id?: string;
  drugbank_id?: string;
  smiles?: string;
  molecular_formula?: string;
  molecular_weight?: number;
  drug_type?: string;
  mechanism_of_action?: string;
  targets: string[];
  bioactivity_summary?: string;
  ic50_ranges: string[];
  clinical_phase?: string;
  indications: string[];
  provenance: string;
}

export interface DiseaseDetail {
  id: string;
  name: string;
  mesh_id?: string;
  category: string;
  overview: string;
  pathophysiology: string;
  associated_compounds: string[];
  research_volume_annual: Record<string, number>;
  key_targets: string[];
  active_trials_count: number;
}

export interface ClinicalTrialDetail {
  nct_id: string;
  title: string;
  status: string;
  phase?: string;
  condition: string;
  intervention: string;
  sponsor: string;
  study_type: string;
  start_date?: string;
  completion_date?: string;
  locations: string[];
  eligibility_summary?: string;
  source_url: string;
}

export interface ResearcherDetail {
  id: string;
  name: string;
  primary_affiliation: string;
  research_topics: string[];
  top_publications: Array<{ title: string; year: number; journal?: string }>;
  associated_compounds: string[];
  associated_diseases: string[];
  total_citations?: number;
}

export interface OrganizationDetail {
  id: string;
  name: string;
  org_type: string;
  country?: string;
  key_investigators: string[];
  active_trials_count: number;
  publications_count: number;
  research_focus: string[];
}

export interface ConfidenceMetrics {
  overall_confidence: number;
  label: string;
  relevant_sources_count: number;
  source_diversity: number;
  recency_score: number;
  directness_score: number;
  consistency_score: number;
  explanation: string;
}

export interface ClarificationOption {
  id: string;
  label: string;
  description?: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  is_multi_select: boolean;
  options: ClarificationOption[];
}

export interface ClarificationResponse {
  needs_clarification: boolean;
  identified_entities: {
    compounds?: string[];
    diseases?: string[];
    targets?: string[];
  };
  clarification_message?: string;
  questions: ClarificationQuestion[];
  recommended_focus?: string;
}

export interface GroundedSynthesis {
  executive_summary: string;
  key_findings: string[];
  mechanisms: string[];
  clinical_evidence: string[];
  preclinical_evidence: string[];
  contradictory_findings: string[];
  research_gaps: string[];
  what_we_cannot_conclude: string[];
}

export interface SourceStatus {
  source_name: string;
  is_available: boolean;
  records_retrieved: number;
  latency_ms: number;
  status_message: string;
}

export interface ResearchQueryResult {
  session_id: string;
  query: string;
  focus: string;
  timeframe: string;
  timestamp: string;
  is_demo: boolean;
  sources_analyzed: string[];
  source_statuses: SourceStatus[];
  confidence: ConfidenceMetrics;
  agreement_status: AgreementStatus;
  conflicts_count: number;
  conflicts: ConflictRecord[];
  synthesis: GroundedSynthesis;
  evidence_claims: EvidenceClaim[];
  citations: CitationItem[];
  timeline: ResearchTimelineEvent[];
  graph: KnowledgeGraph;
  compounds: CompoundDetail[];
  diseases: DiseaseDetail[];
  clinical_trials: ClinicalTrialDetail[];
  researchers: ResearcherDetail[];
  organizations: OrganizationDetail[];
  related_queries: string[];
}

export interface LiteratureSearchRequest {
  query: string;
  year_start?: number;
  year_end?: number;
  study_type?: string;
  sort_by?: 'relevance' | 'date_desc';
  limit?: number;
}

export interface LiteratureSearchResponse {
  query: string;
  total_found: number;
  papers: CitationItem[];
  sources_used: string[];
  latency_ms: number;
}

export interface StudyEvidenceItem {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  pmid?: string;
  doi?: string;
  source_url: string;
  study_type: string;
  experimental_model: string;
  dosage_or_concentration?: string;
  classification: 'supporting' | 'conflicting' | 'inconclusive';
  main_finding: string;
  limitations: string;
  evidence_explanation: string;
  requires_human_review?: boolean;
}

export interface ConflictRadarAnalysis {
  target_topic: string;
  consensus_summary: string;
  overall_classification: string;
  supporting_studies: StudyEvidenceItem[];
  conflicting_studies: StudyEvidenceItem[];
  inconclusive_studies: StudyEvidenceItem[];
  methodological_divergence: string;
  experimental_context_explanation: string;
  citations_count: number;
}

export interface ResearchGapItem {
  id: string;
  research_question: string;
  why_it_matters: string;
  what_literature_shows: string;
  missing_or_limited_evidence: string;
  suggested_investigation_or_experiments: string;
  relevant_citations: string[];
  gap_category: string;
}

export interface ResearchGapAnalysis {
  topic: string;
  identified_gaps: ResearchGapItem[];
  overview_summary: string;
  disclaimer: string;
  retrieved_papers_count: number;
}

export interface CollectionItem {
  id: string;
  item_type: string;
  title: string;
  reference_id: string;
  metadata?: Record<string, any>;
  notes?: string;
  added_at: string;
}

export interface CollectionResponse {
  id: string;
  title: string;
  description?: string;
  color: string;
  created_at: string;
  items_count: number;
  items: CollectionItem[];
}

export interface DataSourceStatus {
  name: string;
  endpoint: string;
  is_connected: boolean;
  latency_ms: number;
  last_ping: string;
  rate_limit_info: string;
}

export interface SystemSettings {
  llm_provider: string;
  gemini_api_key_configured: boolean;
  openai_api_key_configured: boolean;
  cache_enabled: boolean;
  active_sources: string[];
  safety_disclaimer_version: string;
}

// ----------------------------------------------------
// AI Future Life Simulator Types
// ----------------------------------------------------

export interface UserBiomarkersState {
  name: string;
  age: number;
  gender: 'male' | 'female';
  height_cm: number;
  weight_kg: number;
  blood_group: string;
  fasting_glucose_mg_dl?: number;
  hba1c_pct?: number;
  total_cholesterol_mg_dl?: number;
  ldl_cholesterol_mg_dl?: number;
  hdl_cholesterol_mg_dl?: number;
  triglycerides_mg_dl?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  alt_u_l?: number;
  ast_u_l?: number;
  egfr_ml_min?: number;
  creatinine_mg_dl?: number;
  tsh_uiu_ml?: number;
  family_history_diabetes: boolean;
  family_history_heart_disease: boolean;
}

export interface LifestyleHabitsState {
  sleep_hours: number;
  exercise_minutes_per_day: number;
  exercise_days_per_week: number;
  daily_water_liters: number;
  fast_food_meals_per_week: number;
  stress_level_1_to_10: number;
  smoking_status: 'never' | 'former' | 'current';
  alcohol_drinks_per_week: number;
  screen_time_hours_per_day: number;
  working_hours_per_day: number;
}

export interface FutureHealthScenario {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  health_score_current: number;
  health_score_1yr: number;
  health_score_3yr: number;
  health_score_5yr: number;
  health_score_10yr: number;
  weight_5yr_kg: number;
  bmi_5yr: number;
  diabetes_risk_5yr_pct: number;
  heart_disease_risk_5yr_pct: number;
  hypertension_risk_5yr_pct: number;
  fatty_liver_risk_5yr_pct: number;
  kidney_risk_5yr_pct: number;
  estimated_biological_age_delta_5yr: number;
  key_projected_outcomes: string[];
  positive_indicators: string[];
  warning_indicators: string[];
}

export interface LongitudinalMilestone {
  year: number;
  scenario_1_status: string;
  scenario_2_status: string;
  scenario_3_status: string;
  scenario_4_status: string;
  key_biomarker_milestone: string;
}

export interface MicroHabitPlanWeek {
  week_number: number;
  focus_theme: string;
  daily_target_steps: number;
  daily_target_water_l: number;
  sleep_bedtime: string;
  nutrition_action: string;
  stress_activity: string;
  expected_biological_benefit: string;
}

export interface SimulationResult {
  session_id: string;
  timestamp: string;
  user_name: string;
  current_bmi: number;
  current_health_score: number;
  sub_scores: {
    heart_health: number;
    diabetes_protection: number;
    fitness: number;
    mental_wellness: number;
    sleep_quality: number;
    nutrition: number;
  };
  disease_probabilities: {
    type_2_diabetes: number;
    cardiovascular_disease: number;
    hypertension: number;
    fatty_liver_disease: number;
    chronic_kidney_disease: number;
  };
  scenarios: FutureHealthScenario[];
  longitudinal_timeline: LongitudinalMilestone[];
  micro_habit_plan: MicroHabitPlanWeek[];
  medical_disclaimer: string;
}

export interface SliderDeltaResult {
  health_score: number;
  diabetes_risk_pct: number;
  heart_disease_risk_pct: number;
  hypertension_risk_pct: number;
  projected_5yr_weight_kg: number;
  biological_age_delta: number;
  lifestyle_grade: string;
}

// ----------------------------------------------------
// Evidence Evolution Types
// ----------------------------------------------------

export interface EvidenceEvolutionNode {
  id: string;
  year: number;
  title: string;
  era_label: string;
  description: string;
  evidence_strength_stars: number; // 1 to 5
  evidence_strength_label: string;
  publications_count: number;
  clinical_trials_count: number;
  meta_analyses_count: number;
  key_breakthrough_paper?: string;
  pmid?: string;
  doi?: string;
  tags: string[];
}

export interface EvidenceEvolutionTopic {
  topic_id: string;
  title: string;
  subtitle: string;
  category: string;
  summary_of_evolution: string;
  current_evidence_rating: number;
  timeline_nodes: EvidenceEvolutionNode[];
  milestones_count?: number;
}
