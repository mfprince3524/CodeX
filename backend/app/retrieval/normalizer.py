import re
from typing import List, Dict, Any, Set, Tuple

# Biomedical Entity Dictionary for entity parsing and link resolution
KNOWN_COMPOUNDS = {
    "metformin": {"chembl_id": "CHEMBL1431", "drugbank_id": "DB00331", "smiles": "CN(C)C(=N)NC(=N)N", "mw": 129.16, "targets": ["AMPK", "mTORC1", "Mitochondrial Complex I"]},
    "imatinib": {"chembl_id": "CHEMBL941", "drugbank_id": "DB00619", "smiles": "Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc4nccc(n4)c5cccnc5", "mw": 493.60, "targets": ["BCR-ABL", "PDGFR", "c-KIT"]},
    "pembrolizumab": {"chembl_id": "CHEMBL3137343", "drugbank_id": "DB09037", "smiles": None, "mw": 149000.0, "targets": ["PD-1 (CD279)"]},
    "olaparib": {"chembl_id": "CHEMBL474663", "drugbank_id": "DB09074", "smiles": "O=C(c1cc(Cc2n[nH]c(=O)c3ccccc23)ccc1F)N4CCN(C(=O)C5CC5)CC4", "mw": 434.46, "targets": ["PARP1", "PARP2"]},
    "doxorubicin": {"chembl_id": "CHEMBL53463", "drugbank_id": "DB00997", "smiles": "COc1cccc2C(=O)c3c(O)c4CC(O)(C(=O)CO)CC(OC5CC(N)C(O)C(C)O5)c4c(O)c3C(=O)c12", "mw": 543.52, "targets": ["Topoisomerase II"]},
    "aspirin": {"chembl_id": "CHEMBL25", "drugbank_id": "DB00945", "smiles": "CC(=O)Oc1ccccc1C(=O)O", "mw": 180.16, "targets": ["COX-1", "COX-2"]},
    "curcumin": {"chembl_id": "CHEMBL22485", "drugbank_id": "DB08824", "smiles": "COc1cc(C=CC(=O)CC(=O)C=Cc2ccc(O)c(OC)c2)ccc1O", "mw": 368.38, "targets": ["NF-kB", "TNF-alpha", "LOX"]},
    "resveratrol": {"chembl_id": "CHEMBL143", "drugbank_id": "DB02709", "smiles": "Oc1ccc(C=Cc2cc(O)cc(O)c2)cc1", "mw": 228.24, "targets": ["SIRT1", "AMPK", "COX-1"]},
}

KNOWN_DISEASES = {
    "alzheimer": {"name": "Alzheimer's Disease", "mesh_id": "D000544", "category": "Neurodegenerative Disorders", "overview": "Progressive neurodegenerative condition characterized by cognitive decline, beta-amyloid aggregation, tau hyperphosphorylation, and neuroinflammation."},
    "melanoma": {"name": "Malignant Melanoma", "mesh_id": "D008545", "category": "Oncology", "overview": "Malignancy arising from melanocytes, driven by BRAF/NRAS mutations and responsive to immune checkpoint inhibition."},
    "breast cancer": {"name": "Breast Carcinoma", "mesh_id": "D001943", "category": "Oncology", "overview": "Heterogeneous malignant neoplasm of the mammary gland with distinct molecular subtypes (HER2+, ER+/PR+, TNBC, BRCA-mutated)."},
    "cml": {"name": "Chronic Myeloid Leukemia", "mesh_id": "D015464", "category": "Hematologic Oncology", "overview": "Myeloproliferative neoplasm characterized by the Philadelphia chromosome (t(9;22)) encoding BCR-ABL1 tyrosine kinase."},
    "diabetes": {"name": "Type 2 Diabetes Mellitus", "mesh_id": "D003924", "category": "Metabolic Disorders", "overview": "Metabolic condition characterized by peripheral insulin resistance and progressive pancreatic beta-cell dysfunction."},
    "parkinson": {"name": "Parkinson's Disease", "mesh_id": "D010300", "category": "Neurodegenerative Disorders", "overview": "Movement disorder caused by dopaminergic neurodegeneration in the substantia nigra with alpha-synuclein Lewy pathology."}
}

class EntityExtractor:
    @staticmethod
    def extract_entities(text: str) -> Dict[str, List[str]]:
        t_lower = text.lower()
        found_compounds = []
        found_diseases = []
        found_targets = []
        
        for c_key, data in KNOWN_COMPOUNDS.items():
            if c_key in t_lower:
                found_compounds.append(c_key.capitalize())
                found_targets.extend(data["targets"])
                
        for d_key, data in KNOWN_DISEASES.items():
            if d_key in t_lower:
                found_diseases.append(data["name"])
                
        # Look for gene/protein patterns
        gene_matches = re.findall(r'\b(BRCA1|BRCA2|EGFR|KRAS|TP53|AMPK|MTOR|HER2|PD-1|PD-L1|VEGF|TNF|IL-6|APOE|TREM2)\b', text, re.IGNORECASE)
        for g in gene_matches:
            upper_g = g.upper()
            if upper_g not in found_targets:
                found_targets.append(upper_g)
                
        return {
            "compounds": list(set(found_compounds)),
            "diseases": list(set(found_diseases)),
            "targets": list(set(found_targets))
        }

    @staticmethod
    def deduplicate_citations(citations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen_keys: Set[str] = set()
        deduped = []
        
        for c in citations:
            pmid = c.get("pmid")
            doi = c.get("doi")
            nct_id = c.get("nct_id")
            chembl_id = c.get("chembl_id")
            
            key = pmid or doi or nct_id or chembl_id or c.get("title", "").strip().lower()
            if key and key not in seen_keys:
                seen_keys.add(key)
                deduped.append(c)
                
        return deduped
