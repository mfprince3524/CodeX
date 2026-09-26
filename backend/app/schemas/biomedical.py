from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EvidenceType(str, Enum):
    CLINICAL = "Clinical"
    PRECLINICAL = "Preclinical"
    MECHANISM = "Mechanism"
    REVIEW = "Review"
    META_ANALYSIS = "Meta-Analysis"
    ALL = "All"

class AgreementStatus(str, Enum):
    MOSTLY_CONSISTENT = "Mostly Consistent"
    MIXED_EVIDENCE = "Mixed Evidence"
    CONFLICTING_EVIDENCE = "Conflicting Evidence"
    INSUFFICIENT_EVIDENCE = "Insufficient Evidence"

class SourceType(str, Enum):
    PUBMED = "PubMed"
    CHEMBL = "ChEMBL"
    CLINICAL_TRIALS = "ClinicalTrials.gov"
    DRUGBANK = "DrugBank"

class TrialStatus(str, Enum):
    RECRUITING = "Recruiting"
    ACTIVE = "Active, not recruiting"
    COMPLETED = "Completed"
    TERMINATED = "Terminated"
    WITHDRAWN = "Withdrawn"
    UNKNOWN = "Unknown"

# Source & Citation Models
class CitationItem(BaseModel):
    id: str
    marker: str  # e.g. "[1]"
    title: str
    authors: List[str] = []
    journal: Optional[str] = None
    publication_date: Optional[str] = None
    year: Optional[int] = None
    pmid: Optional[str] = None
    doi: Optional[str] = None
    source_id: Optional[str] = None
    source_type: SourceType = SourceType.PUBMED
    source_url: str
    study_type: str = "Observational / In vitro"
    institution: Optional[str] = None
    evidence_excerpt: str
    relevance_score: float = Field(default=0.85, ge=0.0, le=1.0)
    why_it_matters: str = ""
    retrieval_timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

class ConflictRecord(BaseModel):
    id: str
    topic: str
    finding_a: str
    source_a: str
    finding_b: str
    source_b: str
    possible_explanation: str
    clinical_significance: str

class EvidenceClaim(BaseModel):
    id: str
    claim: str
    category: str = "Mechanism"  # Mechanism, Clinical, Safety, Preclinical
    supporting_citations: List[str] = []  # Markers like ["[1]", "[3]"]
    opposing_citations: List[str] = []
    confidence_score: float = Field(default=0.8, ge=0.0, le=1.0)
    agreement_status: AgreementStatus = AgreementStatus.MOSTLY_CONSISTENT
    scientific_context: str = ""

# Graph Models (React Flow compatible)
class GraphNode(BaseModel):
    id: str
    type: str  # disease, compound, target, mechanism, publication, researcher, clinical_trial, organization
    data: Dict[str, Any]
    position: Dict[str, float] = {"x": 0.0, "y": 0.0}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: bool = False
    style: Optional[Dict[str, Any]] = None

class KnowledgeGraph(BaseModel):
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []

# Timeline Model
class ResearchTimelineEvent(BaseModel):
    id: str
    year: int
    date_str: str
    title: str
    event_type: str  # "Preclinical", "Phase 1", "Phase 2", "Phase 3", "Mechanism", "Publication"
    summary: str
    citation_marker: Optional[str] = None
    source_name: str
    source_url: Optional[str] = None
    pmid: Optional[str] = None

# Entity Models
class CompoundDetail(BaseModel):
    id: str
    name: str
    chembl_id: Optional[str] = None
    drugbank_id: Optional[str] = None
    smiles: Optional[str] = None
    molecular_formula: Optional[str] = None
    molecular_weight: Optional[float] = None
    drug_type: Optional[str] = "Small molecule"
    mechanism_of_action: Optional[str] = None
    targets: List[str] = []
    bioactivity_summary: Optional[str] = None
    ic50_ranges: List[str] = []
    clinical_phase: Optional[str] = None
    indications: List[str] = []
    provenance: str = "EMBL-EBI ChEMBL / Verified Index"

class DiseaseDetail(BaseModel):
    id: str
    name: str
    mesh_id: Optional[str] = None
    category: str
    overview: str
    pathophysiology: str
    associated_compounds: List[str] = []
    research_volume_annual: Dict[str, int] = {}
    key_targets: List[str] = []
    active_trials_count: int = 0

class ClinicalTrialDetail(BaseModel):
    nct_id: str
    title: str
    status: TrialStatus = TrialStatus.UNKNOWN
    phase: Optional[str] = None
    condition: str
    intervention: str
    sponsor: str
    study_type: str = "Interventional"
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    locations: List[str] = []
    eligibility_summary: Optional[str] = None
    source_url: str

class ResearcherDetail(BaseModel):
    id: str
    name: str
    primary_affiliation: str
    research_topics: List[str] = []
    top_publications: List[Dict[str, Any]] = []
    associated_compounds: List[str] = []
    associated_diseases: List[str] = []
    total_citations: Optional[int] = None

class OrganizationDetail(BaseModel):
    id: str
    name: str
    org_type: str  # "Research Institution", "Biotech/Pharma Sponsor", "Publisher", "Regulatory Agency"
    country: Optional[str] = None
    key_investigators: List[str] = []
    active_trials_count: int = 0
    publications_count: int = 0
    research_focus: List[str] = []

# Confidence Analytics
class ConfidenceMetrics(BaseModel):
    overall_confidence: float = Field(ge=0.0, le=1.0)
    label: str  # "High Confidence", "Moderate Confidence", "Preliminary Evidence"
    relevant_sources_count: int
    source_diversity: float = Field(ge=0.0, le=1.0)
    recency_score: float = Field(ge=0.0, le=1.0)
    directness_score: float = Field(ge=0.0, le=1.0)
    consistency_score: float = Field(ge=0.0, le=1.0)
    explanation: str = "Calculated via BioMindQ Multi-Factor Evidence Assessment"

# Clarification
class ClarificationOption(BaseModel):
    id: str
    label: str
    description: Optional[str] = None

class ClarificationQuestion(BaseModel):
    id: str
    question: str
    is_multi_select: bool = False
    options: List[ClarificationOption]

class ClarificationResponse(BaseModel):
    needs_clarification: bool
    identified_entities: Dict[str, List[str]] = {}  # compounds, diseases, targets
    clarification_message: Optional[str] = None
    questions: List[ClarificationQuestion] = []
    recommended_focus: Optional[str] = None

# Query Request / Response
class ResearchQueryRequest(BaseModel):
    query: str
    focus: Optional[str] = "Mechanism & Clinical"  # Mechanism, Clinical, Preclinical, Safety, All
    timeframe: Optional[str] = "All"  # "Last 5 years", "Last 10 years", "All"
    evidence_type: Optional[str] = "All"
    sources: List[str] = ["PubMed", "ChEMBL", "ClinicalTrials.gov", "DrugBank"]
    clarification_answers: Optional[Dict[str, Any]] = None
    is_demo: bool = False

class GroundedSynthesis(BaseModel):
    executive_summary: str
    key_findings: List[str]
    mechanisms: List[str]
    clinical_evidence: List[str]
    preclinical_evidence: List[str]
    contradictory_findings: List[str]
    research_gaps: List[str]
    what_we_cannot_conclude: List[str]

class SourceStatus(BaseModel):
    source_name: str
    is_available: bool
    records_retrieved: int
    latency_ms: float
    status_message: str

class ResearchQueryResult(BaseModel):
    session_id: str
    query: str
    focus: str
    timeframe: str
    timestamp: str
    is_demo: bool = False
    sources_analyzed: List[str]
    source_statuses: List[SourceStatus]
    confidence: ConfidenceMetrics
    agreement_status: AgreementStatus
    conflicts_count: int
    conflicts: List[ConflictRecord] = []
    synthesis: GroundedSynthesis
    evidence_claims: List[EvidenceClaim] = []
    citations: List[CitationItem] = []
    timeline: List[ResearchTimelineEvent] = []
    graph: KnowledgeGraph
    compounds: List[CompoundDetail] = []
    diseases: List[DiseaseDetail] = []
    clinical_trials: List[ClinicalTrialDetail] = []
    researchers: List[ResearcherDetail] = []
    organizations: List[OrganizationDetail] = []
    related_queries: List[str] = []

# Collections
class CollectionItem(BaseModel):
    id: str
    item_type: str  # "query", "paper", "compound", "disease", "trial"
    title: str
    reference_id: str
    metadata: Dict[str, Any] = {}
    notes: Optional[str] = None
    added_at: str

class CollectionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    color: Optional[str] = "#0A5BFF"

class CollectionResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    color: str
    created_at: str
    items_count: int
    items: List[CollectionItem] = []
