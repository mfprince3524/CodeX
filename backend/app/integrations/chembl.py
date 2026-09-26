import httpx
from typing import List, Dict, Any, Optional
from app.integrations.base import BaseAdapter
from app.core.config import settings
from app.core.logging import logger

class ChEMBLAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(name="ChEMBL")
        self.base_url = settings.CHEMBL_BASE_URL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS

    def get_source_url(self, identifier: str) -> str:
        return f"https://www.ebi.ac.uk/chembl/compound_report_card/{identifier}/"

    async def search(self, query: str, limit: int = 5, **kwargs) -> List[Dict[str, Any]]:
        # Search molecules by text or pref_name
        search_url = f"{self.base_url}/molecule/search.json"
        params = {"q": query, "limit": limit}
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(search_url, params=params)
                if resp.status_code != 200:
                    logger.warning(f"ChEMBL search returned status {resp.status_code} for '{query}'")
                    return []
                
                data = resp.json()
                molecules = data.get("molecules", [])
                results = []
                for mol in molecules:
                    normalized = self.normalize(mol)
                    if normalized:
                        results.append(normalized)
                return results
        except Exception as e:
            logger.error(f"ChEMBL search exception: {str(e)}")
            return []

    async def get_details(self, identifier: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/molecule/{identifier}.json"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    return None
                return self.normalize(resp.json())
        except Exception as e:
            logger.error(f"ChEMBL get_details exception for '{identifier}': {str(e)}")
            return None

    async def get_activities_and_targets(self, chembl_id: str, limit: int = 5) -> Dict[str, Any]:
        """Fetch target mechanisms and IC50/Ki bioactivities for compound."""
        url = f"{self.base_url}/activity.json"
        params = {"molecule_chembl_id": chembl_id, "limit": limit}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params)
                if resp.status_code != 200:
                    return {"targets": [], "bioactivities": []}
                
                activities_raw = resp.json().get("activities", [])
                targets = []
                bioactivities = []
                for act in activities_raw:
                    target_name = act.get("target_pref_name")
                    if target_name and target_name not in targets:
                        targets.append(target_name)
                    
                    std_type = act.get("standard_type")
                    std_val = act.get("standard_value")
                    std_units = act.get("standard_units")
                    if std_type and std_val:
                        bioactivities.append(f"{std_type}: {std_val} {std_units or 'nM'} on {target_name or 'target'}")
                        
                return {"targets": targets, "bioactivities": bioactivities}
        except Exception as e:
            logger.error(f"ChEMBL activity fetch failed: {str(e)}")
            return {"targets": [], "bioactivities": []}

    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        chembl_id = raw_item.get("molecule_chembl_id", "")
        pref_name = raw_item.get("pref_name") or raw_item.get("molecule_chembl_id", "Unknown Compound")
        props = raw_item.get("molecule_properties") or {}
        structures = raw_item.get("molecule_structures") or {}
        
        mw = None
        if props.get("full_mwt"):
            try:
                mw = float(props["full_mwt"])
            except ValueError:
                pass
                
        max_phase = raw_item.get("max_phase")
        phase_str = f"Phase {max_phase}" if max_phase is not None else "Preclinical / Research Tool"
        if max_phase == 4:
            phase_str = "FDA / Approved Drug (Phase 4)"
            
        smiles = structures.get("canonical_smiles") or structures.get("smiles")
        formula = props.get("full_molformula")
        
        return {
            "source_type": "ChEMBL",
            "source_name": "EMBL-EBI ChEMBL Database",
            "identifier": chembl_id,
            "chembl_id": chembl_id,
            "name": pref_name,
            "title": f"ChEMBL Bioactivity Record: {pref_name} ({chembl_id})",
            "molecular_formula": formula,
            "molecular_weight": mw,
            "smiles": smiles,
            "drug_type": raw_item.get("molecule_type", "Small molecule"),
            "clinical_phase": phase_str,
            "source_url": self.get_source_url(chembl_id),
            "study_type": "Bioassay & Molecular Target Characterization",
            "provenance": "EMBL-EBI ChEMBL REST API v2"
        }
