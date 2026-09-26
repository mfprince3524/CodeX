# BioMindQ — Biomedical Intelligence Architecture

> **Tagline:** Biomedical Intelligence. Grounded in Evidence.

## 1. System Philosophy & Core Pipeline
BioMindQ rejects ungrounded conversational hallucinations in favor of a traceable, evidence-linked pipeline:

```
[ USER QUESTION ]
       ↓
[ INTENT UNDERSTANDING & ENTITY EXTRACTION ]
       ↓
[ SMART CLARIFICATION (Scope / Timeframe / Sources) ]
       ↓
[ RESEARCH PLAN FORMULATION ]
       ↓
[ CONCURRENT MULTI-SOURCE RETRIEVAL (PubMed, ChEMBL, ClinicalTrials, DrugBank) ]
       ↓
[ EVIDENCE NORMALIZATION & DEDUPLICATION ]
       ↓
[ CONFLICT DETECTION & EVIDENCE AGREEMENT SCORING ]
       ↓
[ GROUNDED AI SYNTHESIS (Executive Summary, Key Findings, Mechanisms, Trials, Gaps) ]
       ↓
[ CITATION ALIGNMENT & PROVENANCE GRAPH CONSTRUCTION ]
       ↓
[ STRUCTURED RESEARCH RESULT & INTERACTIVE EXPLORERS ]
```

---

## 2. Component Taxonomy

### A. Backend Layer (`backend/app/`)
- **`core/`**: Central application settings (`config.py`), structured JSON logging (`logging.py`), and async SQLite/PostgreSQL database engine (`database.py`).
- **`integrations/`**: Adapter pattern implementations:
  - `PubMedAdapter`: NCBI Entrez E-Utilities (`esearch.fcgi`, `esummary.fcgi`).
  - `ChEMBLAdapter`: EMBL-EBI REST API for compound properties, canonical SMILES, bioactivities, and target affinities.
  - `ClinicalTrialsAdapter`: ClinicalTrials.gov REST API v2 for NCT protocol retrieval, phase classification, and status badges.
  - `DrugBankAdapter`: Secure server-side credential loading with transparent fallback mode.
- **`retrieval/`**: Multi-source parallel orchestrator with timeout shielding, normalization heuristics, and scientific conflict detection.
- **`rag/`**: Structured synthesis engine, exact citation marker assigner (`[1]`, `[2]`), React Flow knowledge graph builder, and research timeline generator.
- **`services/`**: High-level domain services for research queries, compounds, diseases, clinical trials, and collections.
- **`api/`**: REST router definitions.

### B. Frontend Layer (`frontend/src/`)
- **Bright Scientific Theme**: Inter typography, `#0A5BFF` scientific blue, `#00A7A7` teal, `#7C5CFC` violet accent, `#F7FAFC` background, frosted glass panels.
- **`components/evidence/CitationDrawer`**: Right-side sliding inspector displaying primary source metadata, exact excerpt, and PubMed/ChEMBL links.
- **`components/graph/KnowledgeGraphView`**: Interactive React Flow knowledge graph linking Disease $\to$ Compound $\to$ Target $\to$ Mechanism $\to$ Paper $\to$ Trial.
- **`components/timeline/ResearchTimelineView`**: Chronological milestone visualizer with filters.
- **`components/molecule/MoleculeViewer`**: 2D/3D chemical molecule visualizer with SMILES copy, zoom, rotate, and formula tooltips.
- **`components/clarification/ClarificationModal`**: Smart multi-dimensional scope narrowing modal.

---

## 3. Database Schema
Normalized relational entities:
- `research_sessions`: Session query, focus, confidence, agreement status, synthesis JSON.
- `publications`: PMID, DOI, title, authors, journal, year, study type, source URL.
- `compounds`: ChEMBL ID, DrugBank ID, SMILES, formula, molecular weight, targets.
- `diseases`: MeSH ID, category, pathophysiology overview, active trials count.
- `clinical_trials`: NCT ID, title, status, phase, condition, intervention, sponsor.
- `collections`: User research dossiers with custom items and notes.
