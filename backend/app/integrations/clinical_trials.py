import httpx
from typing import List, Dict, Any, Optional
from app.integrations.base import BaseAdapter
from app.core.config import settings
from app.core.logging import logger

class ClinicalTrialsAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(name="ClinicalTrials.gov")
        self.base_url = settings.CLINICALTRIALS_BASE_URL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS

    def get_source_url(self, identifier: str) -> str:
        return f"https://clinicaltrials.gov/study/{identifier}"

    async def search(self, query: str, limit: int = 6, **kwargs) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/studies"
        params = {
            "query.term": query,
            "pageSize": limit,
            "format": "json"
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params)
                if resp.status_code != 200:
                    logger.warning(f"ClinicalTrials.gov returned status {resp.status_code} for '{query}'")
                    return []
                
                data = resp.json()
                studies = data.get("studies", [])
                results = []
                for study in studies:
                    protocol = study.get("protocolSection", {})
                    normalized = self.normalize(protocol)
                    results.append(normalized)
                return results
        except Exception as e:
            logger.error(f"ClinicalTrials.gov search failed: {str(e)}")
            return []

    async def get_details(self, identifier: str) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/studies/{identifier}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params={"format": "json"})
                if resp.status_code != 200:
                    return None
                data = resp.json()
                protocol = data.get("protocolSection", {})
                return self.normalize(protocol)
        except Exception as e:
            logger.error(f"ClinicalTrials get_details failed for {identifier}: {str(e)}")
            return None

    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        ident_module = raw_item.get("identificationModule", {})
        status_module = raw_item.get("statusModule", {})
        design_module = raw_item.get("designModule", {})
        conditions_module = raw_item.get("conditionsModule", {})
        arms_module = raw_item.get("armsInterventionsModule", {})
        sponsor_module = raw_item.get("sponsorCollaboratorsModule", {})
        
        nct_id = ident_module.get("nctId", "NCT00000000")
        title = ident_module.get("briefTitle") or ident_module.get("officialTitle", "Clinical Investigation")
        
        overall_status = status_module.get("overallStatus", "Unknown")
        # Map into standard badges: Recruiting, Active, not recruiting, Completed, Terminated, Unknown
        status_label = "Active, not recruiting"
        if "RECRUITING" in overall_status.upper():
            status_label = "Recruiting"
        elif "COMPLETED" in overall_status.upper():
            status_label = "Completed"
        elif "TERMINATED" in overall_status.upper():
            status_label = "Terminated"
        elif "WITHDRAWN" in overall_status.upper():
            status_label = "Withdrawn"
            
        phases = design_module.get("phases", [])
        phase_str = ", ".join(phases) if phases else "Phase N/A"
        
        conditions = conditions_module.get("conditions", ["Biomedical Indication"])
        interventions = []
        for inv in arms_module.get("interventions", []):
            name = inv.get("name")
            if name:
                interventions.append(name)
        
        sponsor = sponsor_module.get("leadSponsor", {}).get("name", "Academic Research Collaborative")
        
        start_date = status_module.get("startDateStruct", {}).get("date")
        comp_date = status_module.get("completionDateStruct", {}).get("date")
        
        return {
            "source_type": "ClinicalTrials.gov",
            "source_name": "ClinicalTrials.gov Registry",
            "identifier": nct_id,
            "nct_id": nct_id,
            "title": title,
            "status": status_label,
            "phase": phase_str,
            "condition": conditions[0] if conditions else "General Medical Condition",
            "all_conditions": conditions,
            "intervention": interventions[0] if interventions else "Targeted Therapy",
            "all_interventions": interventions,
            "sponsor": sponsor,
            "study_type": design_module.get("studyType", "Interventional Clinical Trial"),
            "start_date": start_date,
            "completion_date": comp_date,
            "source_url": self.get_source_url(nct_id),
            "relevance_score": 0.90,
            "why_it_matters": f"{phase_str} trial evaluating {interventions[0] if interventions else 'intervention'} in patients with {conditions[0] if conditions else 'condition'}."
        }
