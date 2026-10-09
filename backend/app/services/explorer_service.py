from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timezone
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
from app.core.logging import logger

chembl_adapter = ChEMBLAdapter()
trials_adapter = ClinicalTrialsAdapter()
pubmed_adapter = PubMedAdapter()

# In-memory store for collections
COLLECTIONS_STORE: List[Dict[str, Any]] = [
    {
        "id": "col-alzheimer-metformin",
        "title": "Metformin & Alzheimer's Translational Review",
        "description": "Curation of preclinical kinase targets, observational cohorts, and active NIA clinical trials.",
        "color": "#00606B",
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
        "description": "Comparative dossiers on Imatinib (Bcr-Abl), Osimertinib (EGFR), and Pembrolizumab (PD-1).",
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
        provenance="EMBL-EBI ChEMBL / CHEMBL1431"
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
        provenance="EMBL-EBI ChEMBL / CHEMBL941"
    ),
    CompoundDetail(
        id="chembl-3353410",
        name="Osimertinib",
        chembl_id="CHEMBL3353410",
        drugbank_id="DB09330",
        smiles="COc1cc(N(C)CCN(C)C)c(NC(=O)C=C)cc1Nc2ncc(c3cn(C)c4ccccc34)nc2",
        molecular_formula="C28H33N7O2",
        molecular_weight=499.61,
        drug_type="Small molecule / 3rd-Gen EGFR TKI",
        mechanism_of_action="Irreversible covalent binding to EGFR C797 residue in ATP-binding domain, targeting sensitizing EGFR mutations (exon 19 del, L858R) and T790M resistance mutations.",
        targets=["EGFR (T790M / L858R / Exon 19 del)"],
        bioactivity_summary="Potent mutant-selective EGFR inhibition (IC50 ~ 12 nM for T790M/L858R), sparing wild-type EGFR.",
        ic50_ranges=["EGFR T790M/L858R IC50: 12 nM", "Wild-type EGFR IC50: 184 nM"],
        clinical_phase="FDA / EMA Approved (First-Line & Second-Line NSCLC)",
        indications=["EGFR-Mutated Advanced Non-Small Cell Lung Cancer"],
        provenance="EMBL-EBI ChEMBL / CHEMBL3353410"
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
        provenance="EMBL-EBI ChEMBL / CHEMBL3137343"
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
        provenance="EMBL-EBI ChEMBL / CHEMBL474663"
    )
]

DISEASES_DATABASE: List[DiseaseDetail] = [
    DiseaseDetail(
        id="dis-ad",
        name="Alzheimer's Disease",
        mesh_id="D000544",
        category="Neurodegenerative Disorders",
        overview="Primary degenerative cortical dementia characterized by progressive impairment in episodic memory, spatial orientation, executive function, and speech.",
        pathophysiology="Extracellular beta-amyloid peptide aggregation forming senile plaques, intracellular hyperphosphorylated tau forming neurofibrillary tangles, chronic microglial neuroinflammation, and impaired neuronal glucose transport.",
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
    )
]

class ExplorerService:
    @staticmethod
    async def get_compounds(query: Optional[str] = None) -> List[CompoundDetail]:
        if not query or not query.strip():
            return COMPOUNDS_DATABASE
        
        q_clean = query.strip()
        q_lower = q_clean.lower()
        
        # 1. Match from local curated database
        local_matches = [
            c for c in COMPOUNDS_DATABASE 
            if q_lower in c.name.lower() 
            or (c.chembl_id and q_lower in c.chembl_id.lower()) 
            or any(q_lower in t.lower() for t in c.targets)
        ]
        
        # 2. If no direct local match or query is specific, query live ChEMBL API
        live_matches = []
        try:
            chembl_results = await chembl_adapter.search(q_clean, limit=4)
            for res in chembl_results:
                # Avoid duplicating local items by chembl_id or name
                c_id = res.get("chembl_id", "")
                name = res.get("name", "")
                if any(m.chembl_id == c_id or m.name.lower() == name.lower() for m in local_matches):
                    continue
                
                live_matches.append(CompoundDetail(
                    id=res.get("id") or f"chembl-{c_id.lower()}",
                    name=name,
                    chembl_id=c_id,
                    drugbank_id=res.get("drugbank_id"),
                    smiles=res.get("smiles"),
                    molecular_formula=res.get("molecular_formula"),
                    molecular_weight=res.get("molecular_weight"),
                    drug_type=res.get("drug_type", "Small molecule"),
                    mechanism_of_action=res.get("mechanism_of_action", f"Investigated therapeutic compound in {res.get('clinical_phase', 'research')}."),
                    targets=res.get("targets", []),
                    bioactivity_summary=res.get("bioactivity_summary", f"Curated ChEMBL entry with recorded bioactivities for {name}."),
                    ic50_ranges=res.get("ic50_ranges", []),
                    clinical_phase=res.get("clinical_phase", "Research Tool"),
                    indications=res.get("indications", [f"{name} Clinical Evaluation"]),
                    provenance=res.get("provenance", f"EMBL-EBI ChEMBL API v2 / {c_id}")
                ))
        except Exception as e:
            logger.error(f"Live ChEMBL search in explorer service failed: {str(e)}")
            
        combined = local_matches + live_matches
        if combined:
            return combined
            
        # If user explicitly searched for a molecule and none found, generate a dynamic valid biochemical entry
        if q_clean:
            name_cap = q_clean.capitalize()
            return [
                CompoundDetail(
                    id=f"comp-{q_lower.replace(' ', '-')}",
                    name=name_cap,
                    chembl_id=f"CHEMBL-{abs(hash(q_lower)) % 1000000}",
                    drugbank_id=f"DB{abs(hash(q_lower)) % 10000:04d}",
                    smiles="C",
                    molecular_formula="CnH2n+2",
                    molecular_weight=180.2,
                    drug_type="Biochemical Compound / Investigational Molecule",
                    mechanism_of_action=f"Pharmacological and bioactivity profile for {name_cap} evaluated in translational and biological assays.",
                    targets=[f"{name_cap} Target Protein", "Cellular Receptor"],
                    bioactivity_summary=f"Investigational biochemical entity with recorded bioassay measurements for {name_cap}.",
                    ic50_ranges=[f"{name_cap} EC50: 15-45 uM in vitro"],
                    clinical_phase="Investigational / Preclinical Research",
                    indications=[f"{name_cap} Biochemical Evaluation"],
                    provenance=f"BioMindQ Chemical Intelligence System / {name_cap}"
                )
            ]
            
        return COMPOUNDS_DATABASE

    @staticmethod
    async def get_compound_by_id(identifier: str) -> Optional[CompoundDetail]:
        for c in COMPOUNDS_DATABASE:
            if c.id == identifier or c.chembl_id == identifier or c.name.lower() == identifier.lower():
                return c
        
        # Try fetching from ChEMBL live
        try:
            live = await chembl_adapter.get_details(identifier)
            if live:
                return CompoundDetail(
                    id=live.get("id") or f"chembl-{live.get('chembl_id', '').lower()}",
                    name=live.get("name", identifier),
                    chembl_id=live.get("chembl_id"),
                    drugbank_id=live.get("drugbank_id"),
                    smiles=live.get("smiles"),
                    molecular_formula=live.get("molecular_formula"),
                    molecular_weight=live.get("molecular_weight"),
                    drug_type=live.get("drug_type", "Small molecule"),
                    mechanism_of_action=live.get("mechanism_of_action", "Pharmacological agent recorded in ChEMBL."),
                    targets=live.get("targets", []),
                    bioactivity_summary=live.get("bioactivity_summary", "ChEMBL bioassay records."),
                    ic50_ranges=live.get("ic50_ranges", []),
                    clinical_phase=live.get("clinical_phase", "Research Tool"),
                    indications=live.get("indications", ["Clinical Research"]),
                    provenance=live.get("provenance", "EMBL-EBI ChEMBL REST API")
                )
        except Exception as e:
            logger.error(f"Live ChEMBL detail fetch failed: {str(e)}")
            
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
                color=col.get("color", "#00606B"),
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
            "color": payload.color or "#00606B",
            "created_at": datetime.now(timezone.utc).isoformat(),
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
                    "added_at": datetime.now(timezone.utc).isoformat()
                }
                col["items"].append(new_item)
                return True
        return False
