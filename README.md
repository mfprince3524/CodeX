# BioMindQ — Biomedical Intelligence. Grounded in Evidence.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![React Flow](https://img.shields.io/badge/ReactFlow-12.0-FF0072.svg)](https://reactflow.dev)

BioMindQ is an enterprise-grade biomedical research intelligence platform built for researchers, clinicians, students, and life science professionals. It eliminates AI hallucinations by systematically anchoring every factual statement to peer-reviewed literature (PubMed / NCBI E-Utilities), chemical bioassay registries (EMBL-EBI ChEMBL), and active clinical protocols (ClinicalTrials.gov).

---

## 1. Project Structure

```
biomindq/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Routers (research, compounds, diseases, clinical-trials, collections, health)
│   │   ├── core/            # Config, async database engine, structured logging
│   │   ├── integrations/    # Biomedical adapters (PubMedAdapter, ChEMBLAdapter, ClinicalTrialsAdapter, DrugBankAdapter)
│   │   ├── models/          # Normalized SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic v2 schemas for evidence, claims, graphs, and citations
│   │   ├── retrieval/       # Concurrent orchestrator, deduplication, normalizer, conflict detector
│   │   ├── rag/             # Grounded AI synthesis engine, citation assigner, React Flow graph builder
│   │   └── services/        # Research and Explorer domain business logic
│   ├── tests/               # Pytest automated test suite
│   ├── requirements.txt     # Python dependencies
│   ├── pytest.ini           # Test configuration
│   ├── run.py               # Local server runner
│   └── .env.example         # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Header, Sidebar, ConfidenceGauge, ConflictMatrix, MedicalDisclaimerModal
│   │   │   ├── evidence/    # CitationDrawer (sliding right-side inspector)
│   │   │   ├── graph/       # KnowledgeGraphView (interactive React Flow graph)
│   │   │   ├── timeline/    # ResearchTimelineView (interactive chronological milestone stream)
│   │   │   ├── molecule/    # MoleculeViewer (interactive 2D/3D chemical structure visualizer)
│   │   │   └── clarification/# ClarificationModal (multi-dimensional scope narrowing)
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx          # Showcase with animated particle network & benchmark loaders
│   │   │   ├── CommandCenter.tsx        # Daily research hub & telemetry dashboard
│   │   │   ├── ResearchWorkspace.tsx    # Central evidence intelligence workspace
│   │   │   ├── CompoundExplorer.tsx     # Chemical structures, SMILES, targets & IC50s
│   │   │   ├── DiseaseExplorer.tsx      # Pathology & annual publication volume charts (Recharts)
│   │   │   ├── ClinicalTrialsExplorer.tsx# Phase 1-4 protocol registry
│   │   │   └── CollectionsPage.tsx      # Saved research dossiers & markdown exporter
│   │   ├── services/        # Typed API client with fallback resilience
│   │   ├── types/           # TypeScript interfaces matching backend models
│   │   ├── App.tsx          # Application shell & navigation routing
│   │   └── main.tsx         # Root entrypoint
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/                    # Architecture & pipeline specifications
└── README.md
```

---

## 2. Setup & Installation

### Prerequisites
- **Node.js** >= 18.0.0 (npm >= 9.0)
- **Python** >= 3.10

### Clone & Navigate
```bash
cd C:\Users\Farhan\.gemini\antigravity\scratch\biomindq
```

---

## 3. Environment Variables Configuration

Create `backend/.env` from the template:

```bash
# In backend/
copy .env.example .env
```

Contents of `.env`:
```ini
ENVIRONMENT=development
DEBUG=true

# Database (Default: SQLite for zero-setup local dev; PostgreSQL supported)
DATABASE_URL=sqlite+aiosqlite:///./biomindq.db

# NCBI PubMed API Configuration (Optional API key for higher rate limits)
NCBI_API_KEY=
NCBI_EMAIL=researcher@biomindq.org
NCBI_TOOL=BioMindQ

# DrugBank API Credentials (Optional - Reference profile mode active when omitted)
DRUGBANK_API_KEY=
DRUGBANK_BASE_URL=https://api.drugbank.com/v1

# AI LLM Provider Keys (Optional for live synthesis expansion)
OPENAI_API_KEY=
GEMINI_API_KEY=
```

---

## 4. Backend Startup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python run.py
```
The backend will launch at `http://localhost:8000`.
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

---

## 5. Frontend Startup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend will launch at `http://localhost:5173`.

---

## 6. Running Automated Tests

Run the complete backend test suite:
```bash
cd backend
pytest -v
```
Tests cover:
- Live/mock PubMed parsing and normalization
- EMBL-EBI ChEMBL bioactivity and target resolution
- ClinicalTrials.gov v2 protocol parsing
- Conflict detection and Evidence Agreement status scoring
- End-to-end research query pipeline and citation indexing

---

## 7. Production Build Instructions

To generate optimized production assets:

```bash
cd frontend
npm run build
```
The compiled output will be generated in `frontend/dist/`.

To preview the production build locally:
```bash
npm run preview
```

---

## 8. Medical Safety Notice
BioMindQ is intended strictly for biomedical research and informational use. It does not provide medical diagnosis, clinical treatment recommendations, or personalized medical advice.
