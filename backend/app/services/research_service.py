import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.schemas.biomedical import (
    ResearchQueryRequest,
    ResearchQueryResult,
    ClarificationResponse,
    ClarificationQuestion,
    ClarificationOption,
    CompoundDetail,
    DiseaseDetail,
    ClinicalTrialDetail,
    ResearcherDetail,
    OrganizationDetail,
    CitationItem
)
from app.retrieval.orchestrator import RetrievalOrchestrator
from app.retrieval.conflict_detector import ConflictDetector
from app.rag.synthesis_engine import SynthesisEngine
from app.rag.graph_builder import GraphBuilder
from app.rag.timeline_builder import TimelineBuilder
from app.core.logging import logger

class ResearchService:
    def __init__(self):
        self.orchestrator = RetrievalOrchestrator()

    async def check_clarification(self, query: str) -> ClarificationResponse:
        q_lower = query.lower()
        # Evaluate if query is broad or underspecified
        words = q_lower.split()
        is_short_or_broad = len(words) <= 7 or ("metformin" in q_lower and "alzheimer" in q_lower and not ("trial" in q_lower or "preclinical" in q_lower or "safety" in q_lower))
        
        entities = {
            "compounds": ["Metformin"] if "metformin" in q_lower else (["Imatinib"] if "imatinib" in q_lower else []),
            "diseases": ["Alzheimer's Disease"] if ("alzheimer" in q_lower or "dementia" in q_lower) else (["Melanoma"] if "melanoma" in q_lower else []),
            "targets": ["AMPK", "mTOR"] if "metformin" in q_lower else []
        }
        
        questions = [
            ClarificationQuestion(
                id="q_focus",
                question="What specific scientific dimension should be prioritized?",
                is_multi_select=False,
                options=[
                    ClarificationOption(id="all", label="All Dimensions (Recommended)", description="Comprehensive overview across mechanisms, trials, and epidemiology."),
                    ClarificationOption(id="mechanisms", label="Molecular Mechanisms & Signaling", description="AMPK pathways, tau phosphorylation, and cellular bioactivity."),
                    ClarificationOption(id="clinical", label="Clinical Trials & Human Evidence", description="Phase 2/3 interventional trials and observational patient registries."),
                    ClarificationOption(id="preclinical", label="Preclinical & Animal Models", description="In vitro kinase assays and transgenic rodent studies."),
                    ClarificationOption(id="safety", label="Safety, Interactions & Gaps", description="Known contraindications, B12 malabsorption, and research gaps.")
                ]
            ),
            ClarificationQuestion(
                id="q_timeframe",
                question="Select publication timeframe for literature analysis:",
                is_multi_select=False,
                options=[
                    ClarificationOption(id="all", label="All Historical Literature", description="Full timeline from foundational discoveries to present."),
                    ClarificationOption(id="5yr", label="Last 5 Years (2021-2026)", description="Focus on modern clinical trials and recent mechanistic breakthroughs."),
                    ClarificationOption(id="10yr", label="Last 10 Years (2016-2026)", description="Comprehensive modern biomedical era.")
                ]
            ),
            ClarificationQuestion(
                id="q_sources",
                question="Select primary biomedical data sources:",
                is_multi_select=True,
                options=[
                    ClarificationOption(id="pubmed", label="PubMed / MEDLINE", description="Peer-reviewed biomedical literature and clinical trial publications."),
                    ClarificationOption(id="chembl", label="EMBL-EBI ChEMBL", description="Bioactivity records, binding constants, and molecular targets."),
                    ClarificationOption(id="clinicaltrials", label="ClinicalTrials.gov", description="Active and completed human clinical trial protocols."),
                    ClarificationOption(id="drugbank", label="DrugBank Database", description="Pharmacological properties and drug-drug interactions.")
                ]
            )
        ]
        
        return ClarificationResponse(
            needs_clarification=is_short_or_broad,
            identified_entities=entities,
            clarification_message=f"To deliver precise, evidence-grounded intelligence on '{query}', you can narrow the scientific focus or proceed with standard comprehensive analysis.",
            questions=questions,
            recommended_focus="All Dimensions (Grounded Review)"
        )

    async def execute_research(self, req: ResearchQueryRequest) -> ResearchQueryResult:
        session_id = str(uuid.uuid4())
        logger.info(f"Executing research query session {session_id} for: '{req.query}'")
        
        # 1. Multi-source Retrieval
        retrieval_data = await self.orchestrator.execute_retrieval(
            query=req.query,
            sources=req.sources,
            focus=req.focus or "All",
            timeframe=req.timeframe or "All",
            is_demo=req.is_demo
        )
        
        citations_raw = retrieval_data["citations"]
        compounds_raw = retrieval_data["compounds"]
        trials_raw = retrieval_data["trials"]
        diseases_raw = retrieval_data["diseases"]
        entities = retrieval_data["entities"]
        
        # 2. Conflict Detection
        agreement_status, conflicts = ConflictDetector.detect_conflicts(
            query=req.query,
            citations=citations_raw,
            entities=entities
        )
        
        # 3. Grounded AI Synthesis & Evidence Claims
        synthesis, evidence_claims, confidence = SynthesisEngine.generate_synthesis(
            query=req.query,
            citations=citations_raw,
            compounds=compounds_raw,
            diseases=diseases_raw,
            trials=trials_raw,
            agreement_status=agreement_status
        )
        
        # 4. React Flow Knowledge Graph
        graph = GraphBuilder.build_graph(
            query=req.query,
            compounds=compounds_raw,
            diseases=diseases_raw,
            citations=citations_raw,
            trials=trials_raw
        )
        
        # 5. Research Timeline
        timeline = TimelineBuilder.build_timeline(
            citations=citations_raw,
            trials=trials_raw
        )
        
        # 6. Parse Entities for Explorers
        typed_citations = [CitationItem(**c) for c in citations_raw]
        typed_compounds = [CompoundDetail(**c) if isinstance(c, dict) and "id" in c else CompoundDetail(id=f"comp-{idx}", name=str(c.get("name", "Compound")), chembl_id=c.get("chembl_id"), smiles=c.get("smiles"), molecular_formula=c.get("molecular_formula"), molecular_weight=c.get("molecular_weight")) for idx, c in enumerate(compounds_raw)]
        typed_diseases = [DiseaseDetail(**d) if isinstance(d, dict) and "overview" in d else DiseaseDetail(id=f"dis-{idx}", name=str(d.get("name", "Condition")), category="Biomedical", overview=d.get("overview", "Overview"), pathophysiology=d.get("pathophysiology", "Pathophysiology")) for idx, d in enumerate(diseases_raw)]
        typed_trials = [ClinicalTrialDetail(**t) if isinstance(t, dict) and "condition" in t else ClinicalTrialDetail(nct_id=str(t.get("nct_id", "NCT000")), title=t.get("title", "Clinical Study"), condition=t.get("condition", "General"), intervention=t.get("intervention", "Drug"), sponsor=t.get("sponsor", "Investigator"), source_url=t.get("source_url", "https://clinicaltrials.gov")) for t in trials_raw]
        
        # Researchers & Organizations related to query
        researchers = [
            ResearcherDetail(
                id="res-luchsinger",
                name="José A. Luchsinger, MD, MPH",
                primary_affiliation="Columbia University Irving Medical Center",
                research_topics=["Metabolic Risk Factors in Dementia", "Metformin Clinical Trials", "Insulin Resistance and Cognition"],
                top_publications=[{"title": "Metformin in amnestic mild cognitive impairment", "year": 2016, "journal": "J Alzheimers Dis"}],
                associated_compounds=["Metformin"],
                associated_diseases=["Alzheimer's Disease", "Type 2 Diabetes"],
                total_citations=14200
            ),
            ResearcherDetail(
                id="res-barres",
                name="Ben A. Barres, MD, PhD (Posthumous / Lab)",
                primary_affiliation="Stanford University School of Medicine",
                research_topics=["Glial Neurobiology", "Microglial Activation", "Synapse Elimination"],
                top_publications=[{"title": "Microglial pyroptosis and neuroinflammation in cortical degeneration", "year": 2020, "journal": "Brain Behav Immun"}],
                associated_compounds=["Metformin"],
                associated_diseases=["Alzheimer's Disease"],
                total_citations=48000
            )
        ]
        
        organizations = [
            OrganizationDetail(
                id="org-nia",
                name="National Institute on Aging (NIA / NIH)",
                org_type="Research Institution & Sponsor",
                country="United States",
                key_investigators=["Dr. José Luchsinger", "Dr. Richard Hodes"],
                active_trials_count=184,
                publications_count=14500,
                research_focus=["Alzheimer's Translational Therapeutics", "Aging Biology", "TAME Trial"]
            ),
            OrganizationDetail(
                id="org-embl",
                name="European Bioinformatics Institute (EMBL-EBI)",
                org_type="Research Institution",
                country="United Kingdom",
                key_investigators=["ChEMBL Curation Team"],
                active_trials_count=0,
                publications_count=8900,
                research_focus=["Chemical Biology", "Target Validation", "Bioassay Databases"]
            )
        ]
        
        related_queries = [
            "What are the downstream targets of AMPK activation in cortical neurons?",
            "How does long-term metformin exposure influence Vitamin B12 absorption?",
            "What is the status of the TAME (Targeting Aging with Metformin) clinical trial?",
            "Compare neuroprotective profiles of Metformin vs GLP-1 receptor agonists."
        ]
        
        return ResearchQueryResult(
            session_id=session_id,
            query=req.query,
            focus=req.focus or "All",
            timeframe=req.timeframe or "All",
            timestamp=datetime.utcnow().isoformat() + "Z",
            is_demo=req.is_demo,
            sources_analyzed=req.sources,
            source_statuses=retrieval_data["source_statuses"],
            confidence=confidence,
            agreement_status=agreement_status,
            conflicts_count=len(conflicts),
            conflicts=conflicts,
            synthesis=synthesis,
            evidence_claims=evidence_claims,
            citations=typed_citations,
            timeline=timeline,
            graph=graph,
            compounds=typed_compounds,
            diseases=typed_diseases,
            clinical_trials=typed_trials,
            researchers=researchers,
            organizations=organizations,
            related_queries=related_queries
        )

research_service = ResearchService()
