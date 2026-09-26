export type EvidenceType = 'Clinical' | 'Preclinical' | 'Mechanism' | 'Review' | 'Meta-Analysis' | 'All';

export type AgreementStatus = 'Mostly Consistent' | 'Mixed Evidence' | 'Conflicting Evidence' | 'Insufficient Evidence';

export type SourceType = 'PubMed' | 'ChEMBL' | 'ClinicalTrials.gov' | 'DrugBank';

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
  source_type: SourceType;
  source_url: string;
  study_type: string;
  institution?: string;
  evidence_excerpt: string;
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
    journal?: string;
    year?: number;
    pmid?: string;
    status?: string;
    sponsor?: string;
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
  status: TrialStatus;
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
