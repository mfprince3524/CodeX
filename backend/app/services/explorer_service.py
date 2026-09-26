from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from app.schemas.biomedical import (
    CompoundDetail,
    DiseaseDetail,
    ClinicalTrialDetail,
    ResearcherDetail,
    OrganizationDetail,
    CollectionResponse,
    CollectionCreate,
    CollectionItem
)
from app.integrations.chembl import ChEMBLAdapter
from app.integrations.clinical_trials import ClinicalTrialsAdapter
from app.integrations.pubmed import PubMedAdapter

# In-memory store for collections & fast explorer lookups
COLLECTIONS_STORE: List[Dict[str, Any]] = [
    {
        "id": "col-alzheimer-metformin",
        "title": "Metformin & Alzheimer's Translational Review",
        "description": "Curation of preclinical kinase targets, observational cohorts, and active NIA clinical trials.",
        "color": "#0A5BFF",
        "created_at": "2026-03-15T10:00:00Z",
        "items": [
            {
                "id": "item-1",
                "item_type": "compound",
                "title": "Metformin (CHEMBL1431)",
                "reference_id": "CHEMBL1431",
                "metadata": {"smiles": "CN(C)C(=N)NC(=N)N", "targets": ["AMPK", "Complex I"]},
                "notes": "AMPK activator with neuroprotective and anti-inflammatory properties.",
                "added_at": "2026-03-15T10:05:00Z"
            },
            {
                "id": "item-2",
                "item_type": "paper",
                "title": "Campbell et al. Meta-analysis of dementia risk in diabetic cohorts",
                "reference_id": "28886383",
                "metadata": {"pmid": "28886383", "journal": "Diabetic Medicine", "year": 2018},
                "notes": "Key meta-analysis documenting 24% reduced dementia incidence.",
                "added_at": "2026-03-15T10:12:00Z"
            },
            {
                "id": "item-3",
                "item_type": "trial",
                "title": "Metformin in Amnestic Mild Cognitive Impairment (MAP Trial)",
                "reference_id": "NCT04098666",
                "metadata": {"nct_id": "NCT04098666", "status": "Active, not recruiting", "phase": "Phase 2/Phase 3"},
                "notes": "Ongoing Phase 2/3 multicenter NIA trial at Columbia University.",
                "added_at": "2026-03-15T10:20:00Z"
            }
        ]
    },
    {
        "id": "col-oncology-checkpoint",
        "title": "Targeted Kinase & Checkpoint Inhibitors",
        "description": "Comparative dossiers on Imatinib (Bcr-Abl) and Pembrolizumab (PD-1).",
        "color": "#00A7A7",
        "created_at": "2026-03-18T14:30:00Z",
        "items": [
            {
                "id": "item-4",
                "item_type": "compound",
                "title": "Imatinib (CHEMBL941)",
                "reference_id": "CHEMBL941",
                "metadata": {"smiles": "Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc4nccc(n4)c5cccnc5", "mw": 493.6},
                "notes": "First-in-class BCR-ABL tyrosine kinase inhibitor transforming CML survival.",
                "added_at": "2026-03-18T14:35:00Z"
            }
        ]
    }
]

COMPOUNDS_DATABASE: List[CompoundDetail] = [
    CompoundDetail(
        id="chembl-1431",
        name="Metformin",
        chembl_id="CHEMBL1431",
        drugbank_id="DB00331",
        smiles="CN(C)C(=N)NC(=N)N",
        molecular_formula="C4H11N5",
        molecular_weight=129.16,
        drug_type="Small molecule / Biguanide",
        mechanism_of_action="Allosteric activation of AMP-activated protein kinase (AMPK), suppression of mitochondrial complex I respiration, inhibition of hepatic gluconeogenesis, and downregulation of neuroinflammatory pathways.",
        targets=["AMPK (PRKAA1/2)", "Mitochondrial Complex I", "mTORC1", "NF-kB p65"],
        bioactivity_summary="Activates AMPK phosphorylation at Thr172; lowers tau phosphorylation in primary neuronal models; IC50 for gluconeogenesis inhibition ~ 250 uM.",
        ic50_ranges=["AMPK EC50: 50-100 uM", "Complex I IC50: 1.2 mM", "mTOR inhibition IC50: 2.5 mM"],
        clinical_phase="Approved Drug (FDA/EMA) & Phase 2/3 Investigation for Aging/AD",
        indications=["Type 2 Diabetes Mellitus", "Polycystic Ovary Syndrome (PCOS)", "Translational AD Investigation"],
        provenance="EMBL-EBI ChEMBL / ChEMBL1431"
    ),
    CompoundDetail(
        id="chembl-941",
        name="Imatinib",
        chembl_id="CHEMBL941",
        drugbank_id="DB00619",
        smiles="Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc4nccc(n4)c5cccnc5",
        molecular_formula="C29H31N7O",
        molecular_weight=493.60,
        drug_type="Small molecule / Tyrosine Kinase Inhibitor",
        mechanism_of_action="Selective competitive inhibition of ATP-binding site on BCR-ABL oncogenic fusion protein, c-KIT (CD117), and platelet-derived growth factor receptor (PDGFR).",
        targets=["BCR-ABL1 Tyrosine Kinase", "c-KIT Receptor Tyrosine Kinase", "PDGFR-alpha", "PDGFR-beta"],
        bioactivity_summary="Potent BCR-ABL kinase inhibition with cellular IC50 ~ 25-100 nM; induces apoptosis in Philadelphia chromosome-positive (Ph+) leukemic cell lines.",
        ic50_ranges=["BCR-ABL IC50: 25-38 nM", "c-KIT IC50: 100 nM", "PDGFR IC50: 50 nM"],
        clinical_phase="FDA Approved (Oncology First-Line Standard)",
        indications=["Chronic Myelogenous Leukemia (CML)", "Gastrointestinal Stromal Tumors (GIST)", "Ph+ Acute Lymphoblastic Leukemia"],
        provenance="EMBL-EBI ChEMBL / ChEMBL941"
    ),
    CompoundDetail(
        id="chembl-3137343",
        name="Pembrolizumab",
        chembl_id="CHEMBL3137343",
        drugbank_id="DB09037",
        smiles=None,
        molecular_formula="C6504H10004N1716O2036S46",
        molecular_weight=149000.0,
        drug_type="Monoclonal Antibody (IgG4-kappa)",
        mechanism_of_action="High-affinity humanized monoclonal antibody targeting Programmed Cell Death Protein 1 (PD-1 / CD279), blocking interaction with PD-L1/PD-L2 to restore anti-tumor T-cell cytotoxicity.",
        targets=["PD-1 (CD279)"],
        bioactivity_summary="Sub-nanomolar affinity for human PD-1 receptor (Kd ~ 29 pM), inducing potent cytokine release in mixed lymphocyte reactions.",
        ic50_ranges=["PD-1 Binding Kd: 29 pM", "T-cell Activation EC50: 0.1 nM"],
        clinical_phase="FDA / EMA Approved (Broad Immuno-Oncology Indications)",
        indications=["Malignant Melanoma", "Non-Small Cell Lung Cancer", "Mismatch Repair-Deficient (dMMR) Solid Tumors"],
        provenance="EMBL-EBI ChEMBL / ChEMBL3137343"
    ),
    CompoundDetail(
        id="chembl-474663",
        name="Olaparib",
        chembl_id="CHEMBL474663",
        drugbank_id="DB09074",
        smiles="O=C(c1cc(Cc2n[nH]c(=O)c3ccccc23)ccc1F)N4CCN(C(=O)C5CC5)CC4",
        molecular_formula="C24H23FN4O3",
        molecular_weight=434.46,
        drug_type="Small molecule / PARP Inhibitor",
        mechanism_of_action="Inhibition of poly (ADP-ribose) polymerase (PARP1/2) enzymes, inducing synthetic lethality in tumors harboring homologous recombination deficiency (BRCA1/2 mutations).",
        targets=["PARP1", "PARP2"],
        bioactivity_summary="Potent PARP1 inhibitor (IC50 ~ 5 nM); traps PARP-DNA complexes leading to lethal double-strand breaks during DNA replication.",
        ic50_ranges=["PARP1 IC50: 5 nM", "PARP2 IC50: 1 nM"],
        clinical_phase="FDA / EMA Approved (Synthetic Lethality Precision Oncology)",
        indications=["BRCA-mutated Advanced Ovarian Cancer", "gBRCAm HER2-negative Metastatic Breast Cancer", "BRCA-mutated Pancreatic Cancer"],
        provenance="EMBL-EBI ChEMBL / ChEMBL474663"
    )
]

DISEASES_DATABASE: List[DiseaseDetail] = [
    DiseaseDetail(
        id="dis-ad",
        name="Alzheimer's Disease",
        mesh_id="D000544",
        category="Neurodegenerative Disorders",
        overview="Primary degenerative cortical dementia characterized by progressive impairment in episodic memory, spatial orientation, executive function, and speech.",
        pathophysiology="Extracellular beta-amyloid (Abeta42) peptide aggregation forming senile plaques, intracellular hyperphosphorylated tau forming neurofibrillary tangles, chronic microglial neuroinflammation, and impaired neuronal glucose transport.",
        associated_compounds=["Metformin", "Donepezil", "Memantine", "Lecanemab", "Aducanumab", "Donanemab"],
        research_volume_annual={"2020": 18450, "2021": 20120, "2022": 21890, "2023": 23410, "2024": 24800, "2025": 25900},
        key_targets=["AMPK", "GSK-3beta", "BACE1", "mTOR", "TREM2", "Abeta42"],
        active_trials_count=412
    ),
    DiseaseDetail(
        id="dis-cml",
        name="Chronic Myeloid Leukemia",
        mesh_id="D015464",
        category="Hematologic Oncology",
        overview="Clonal hematopoietic stem cell disorder characterized by marked granulocyte proliferation driven by the reciprocal chromosomal translocation t(9;22)(q34;q11).",
        pathophysiology="Formation of the BCR-ABL1 chimeric gene encoding a constitutively active tyrosine kinase that phosphorylates STAT5, AKT, and RAS/MAPK pathways to prevent apoptosis and promote cell survival.",
        associated_compounds=["Imatinib", "Dasatinib", "Nilotinib", "Bosutinib", "Ponatinib", "Asciminib"],
        research_volume_annual={"2020": 3400, "2021": 3520, "2022": 3610, "2023": 3750, "2024": 3890, "2025": 3980},
        key_targets=["BCR-ABL1", "STAT5", "CRKL", "SRC Family Kinases"],
        active_trials_count=128
    ),
    DiseaseDetail(
        id="dis-melanoma",
        name="Malignant Melanoma",
        mesh_id="D008545",
        category="Oncology",
        overview="Highly aggressive malignant neoplasm originating in cutaneous melanocytes, marked by high ultraviolet-induced mutation burden and early metastatic dissemination.",
        pathophysiology="Constitutive MAPK pathway activation frequently via BRAF V600E (50%) or NRAS (20%) mutations, with immune evasion driven by tumor PD-L1 expression and T-cell exhaustion.",
        associated_compounds=["Pembrolizumab", "Nivolumab", "Ipilimumab", "Dabrafenib", "Trametinib"],
        research_volume_annual={"2020": 12100, "2021": 13200, "2022": 14050, "2023": 14900, "2024": 15600, "2025": 16200},
        key_targets=["PD-1", "PD-L1", "CTLA-4", "BRAF V600E", "MEK1/2"],
        active_trials_count=524
    ),
    DiseaseDetail(
        id="dis-breast-cancer",
        name="BRCA-Mutated Breast Carcinoma",
        mesh_id="D001943",
        category="Oncology / Precision Medicine",
        overview="Malignant epithelial breast neoplasm harboring germline or somatic mutations in BRCA1 or BRCA2 DNA damage repair tumor suppressor genes.",
        pathophysiology="Loss of high-fidelity homologous recombination repair (HRR), rendering cells hyper-dependent on base excision repair pathways mediated by PARP enzymes.",
        associated_compounds=["Olaparib", "Talazoparib", "Trastuzumab", "Tamoxifen"],
        research_volume_annual={"2020": 28400, "2021": 29800, "2022": 31200, "2023": 32500, "2024": 34100, "2025": 35400},
        key_targets=["PARP1", "BRCA1", "BRCA2", "RAD51", "HER2 (ERBB2)"],
        active_trials_count=680
    )
]

CLINICAL_TRIALS_DATABASE: List[ClinicalTrialDetail] = [
    ClinicalTrialDetail(
        nct_id="NCT04098666",
        title="Metformin in Amnestic Mild Cognitive Impairment (MAP Trial)",
        status="Active, not recruiting",
        phase="Phase 2/Phase 3",
        condition="Amnestic Mild Cognitive Impairment",
        intervention="Metformin Extended-Release (2000 mg/day)",
        sponsor="Columbia University / National Institute on Aging (NIA)",
        study_type="Interventional (Randomized, Double-Blind, Placebo-Controlled)",
        start_date="2019-11",
        completion_date="2026-04",
        locations=["New York, NY", "NIA Alzheimer Disease Research Centers Network"],
        eligibility_summary="Aged 55-90, documented amnestic MCI with MoCA scores 18-25, non-diabetic or well-controlled prediabetic.",
        source_url="https://clinicaltrials.gov/study/NCT04098666"
    ),
    ClinicalTrialDetail(
        nct_id="NCT02432924",
        title="Targeting Aging with Metformin (TAME Multi-Center Investigation)",
        status="Recruiting",
        phase="Phase 3 / Geroscience Trial",
        condition="Age-Related Multimorbidity / Cognitive Decline",
        intervention="Metformin 1700 mg/day",
        sponsor="American Federation for Aging Research (AFAR) / Albert Einstein College of Medicine",
        study_type="Interventional (Double-Blind Randomized Controlled Trial)",
        start_date="2022-01",
        completion_date="2028-12",
        locations=["14 Major Academic Medical Centers across the United States"],
        eligibility_summary="Aged 65-79 with one age-related chronic condition, evaluating time to secondary age-related chronic disease or cognitive impairment.",
        source_url="https://clinicaltrials.gov/study/NCT02432924"
    ),
    ClinicalTrialDetail(
        nct_id="NCT01295827",
        title="Phase 3 Study of Pembrolizumab (MK-3475) vs Chemotherapy in Advanced Melanoma (KEYNOTE-006)",
        status="Completed",
        phase="Phase 3",
        condition="Unresectable Stage III or Stage IV Melanoma",
        intervention="Pembrolizumab 10 mg/kg every 2 or 3 weeks vs Ipilimumab",
        sponsor="Merck Sharp & Dohme LLC",
        study_type="Interventional Randomized Active-Controlled Trial",
        start_date="2013-09",
        completion_date="2020-03",
        locations=["Global Multi-Center (USA, Europe, Asia-Pacific)"],
        eligibility_summary="Patients with confirmed unresectable advanced melanoma without prior checkpoint therapy.",
        source_url="https://clinicaltrials.gov/study/NCT01295827"
    ),
    ClinicalTrialDetail(
        nct_id="NCT02000622",
        title="Olaparib in Treating Patients with Advanced HER2-Negative Breast Cancer and Germline BRCA Mutations (OlympiADI)",
        status="Completed",
        phase="Phase 3",
        condition="BRCA-Mutated Metastatic Breast Cancer",
        intervention="Olaparib 300 mg tablets BID vs Standard Chemotherapy",
        sponsor="AstraZeneca",
        study_type="Interventional Randomized Open-Label Trial",
        start_date="2014-04",
        completion_date="2021-08",
        locations=["International Trial across 19 Countries"],
        eligibility_summary="Confirmed germline BRCA1/2 mutation with HER2-negative metastatic breast cancer.",
        source_url="https://clinicaltrials.gov/study/NCT02000622"
    )
]

class ExplorerService:
    @staticmethod
    def get_compounds(query: Optional[str] = None) -> List[CompoundDetail]:
        if not query:
            return COMPOUNDS_DATABASE
        q_lower = query.lower()
        return [c for c in COMPOUNDS_DATABASE if q_lower in c.name.lower() or (c.chembl_id and q_lower in c.chembl_id.lower()) or any(q_lower in t.lower() for t in c.targets)]

    @staticmethod
    def get_compound_by_id(identifier: str) -> Optional[CompoundDetail]:
        for c in COMPOUNDS_DATABASE:
            if c.id == identifier or c.chembl_id == identifier or c.name.lower() == identifier.lower():
                return c
        return None

    @staticmethod
    def get_diseases(query: Optional[str] = None) -> List[DiseaseDetail]:
        if not query:
            return DISEASES_DATABASE
        q_lower = query.lower()
        return [d for d in DISEASES_DATABASE if q_lower in d.name.lower() or q_lower in d.category.lower() or any(q_lower in c.lower() for c in d.associated_compounds)]

    @staticmethod
    def get_disease_by_id(identifier: str) -> Optional[DiseaseDetail]:
        for d in DISEASES_DATABASE:
            if d.id == identifier or (d.mesh_id and d.mesh_id == identifier) or d.name.lower() == identifier.lower():
                return d
        return None

    @staticmethod
    def get_clinical_trials(query: Optional[str] = None, phase: Optional[str] = None, status: Optional[str] = None) -> List[ClinicalTrialDetail]:
        results = CLINICAL_TRIALS_DATABASE
        if query:
            q_lower = query.lower()
            results = [t for t in results if q_lower in t.title.lower() or q_lower in t.condition.lower() or q_lower in t.intervention.lower() or q_lower in t.nct_id.lower()]
        if status and status != "All":
            results = [t for t in results if status.lower() in t.status.lower()]
        return results

    @staticmethod
    def get_collections() -> List[CollectionResponse]:
        res = []
        for col in COLLECTIONS_STORE:
            res.append(CollectionResponse(
                id=col["id"],
                title=col["title"],
                description=col.get("description"),
                color=col.get("color", "#0A5BFF"),
                created_at=col["created_at"],
                items_count=len(col.get("items", [])),
                items=[CollectionItem(**it) for it in col.get("items", [])]
            ))
        return res

    @staticmethod
    def create_collection(payload: CollectionCreate) -> CollectionResponse:
        new_col = {
            "id": f"col-{uuid.uuid4().hex[:8]}",
            "title": payload.title,
            "description": payload.description or "",
            "color": payload.color or "#0A5BFF",
            "created_at": datetime.utcnow().isoformat() + "Z",
            "items": []
        }
        COLLECTIONS_STORE.append(new_col)
        return CollectionResponse(
            id=new_col["id"],
            title=new_col["title"],
            description=new_col["description"],
            color=new_col["color"],
            created_at=new_col["created_at"],
            items_count=0,
            items=[]
        )

    @staticmethod
    def add_to_collection(col_id: str, item: Dict[str, Any]) -> bool:
        for col in COLLECTIONS_STORE:
            if col["id"] == col_id:
                new_item = {
                    "id": f"it-{uuid.uuid4().hex[:8]}",
                    "item_type": item.get("item_type", "paper"),
                    "title": item.get("title", "Saved Biomedical Evidence"),
                    "reference_id": item.get("reference_id", "REF01"),
                    "metadata": item.get("metadata", {}),
                    "notes": item.get("notes", "Saved from BioMindQ Research Workspace"),
                    "added_at": datetime.utcnow().isoformat() + "Z"
                }
                col["items"].append(new_item)
                return True
        return False
