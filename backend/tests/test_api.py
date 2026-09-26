import pytest
import asyncio
from app.integrations.pubmed import PubMedAdapter
from app.integrations.chembl import ChEMBLAdapter
from app.integrations.clinical_trials import ClinicalTrialsAdapter
from app.integrations.drugbank import DrugBankAdapter
from app.retrieval.conflict_detector import ConflictDetector
from app.retrieval.normalizer import EntityExtractor
from app.services.research_service import research_service
from app.schemas.biomedical import ResearchQueryRequest, AgreementStatus

@pytest.mark.asyncio
async def test_entity_extraction():
    entities = EntityExtractor.extract_entities("What is the effect of Metformin on Alzheimer's disease and AMPK?")
    assert "Metformin" in entities["compounds"]
    assert "Alzheimer's Disease" in entities["diseases"]
    assert "AMPK" in entities["targets"]

@pytest.mark.asyncio
async def test_conflict_detection():
    citations = [{"id": "1", "title": "Study 1"}]
    entities = {"compounds": ["Metformin"], "diseases": ["Alzheimer's Disease"]}
    status, conflicts = ConflictDetector.detect_conflicts(
        query="metformin and alzheimer cognitive outcomes",
        citations=citations,
        entities=entities
    )
    assert status == AgreementStatus.MIXED_EVIDENCE
    assert len(conflicts) > 0
    assert "Cognitive Outcomes" in conflicts[0].topic

@pytest.mark.asyncio
async def test_drugbank_adapter_safe_fallback():
    adapter = DrugBankAdapter()
    assert adapter.is_configured() is False
    res = await adapter.search("metformin")
    assert res == []

@pytest.mark.asyncio
async def test_research_query_pipeline():
    req = ResearchQueryRequest(
        query="What research exists on metformin and Alzheimer's disease?",
        focus="All",
        timeframe="All",
        sources=["PubMed", "ChEMBL", "ClinicalTrials.gov", "DrugBank"],
        is_demo=False
    )
    result = await research_service.execute_research(req)
    assert result.session_id is not None
    assert len(result.citations) > 0
    assert result.synthesis.executive_summary is not None
    assert len(result.synthesis.key_findings) > 0
    assert len(result.graph.nodes) > 0
    assert len(result.graph.edges) > 0
    assert len(result.timeline) > 0
    assert result.confidence.overall_confidence > 0.0

@pytest.mark.asyncio
async def test_clarification_check():
    clarification = await research_service.check_clarification("metformin alzheimer")
    assert clarification.needs_clarification is True
    assert len(clarification.questions) >= 3
