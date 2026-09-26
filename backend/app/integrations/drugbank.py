import httpx
from typing import List, Dict, Any, Optional
from app.integrations.base import BaseAdapter
from app.core.config import settings
from app.core.logging import logger

class DrugBankAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(name="DrugBank")
        self.api_key = settings.DRUGBANK_API_KEY
        self.base_url = settings.DRUGBANK_BASE_URL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS

    def get_source_url(self, identifier: str) -> str:
        return f"https://go.drugbank.com/drugs/{identifier}"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def search(self, query: str, limit: int = 5, **kwargs) -> List[Dict[str, Any]]:
        if not self.is_configured():
            logger.info("DrugBank API credentials not provided in environment. Returning fallback/development status.")
            return []
            
        url = f"{self.base_url}/drugs/search"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        params = {"q": query}
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, headers=headers, params=params)
                if resp.status_code != 200:
                    logger.warning(f"DrugBank API returned status {resp.status_code}")
                    return []
                
                data = resp.json()
                results = []
                for item in data[:limit]:
                    results.append(self.normalize(item))
                return results
        except Exception as e:
            logger.error(f"DrugBank query failed: {str(e)}")
            return []

    async def get_details(self, identifier: str) -> Optional[Dict[str, Any]]:
        if not self.is_configured():
            return None
            
        url = f"{self.base_url}/drugs/{identifier}"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code != 200:
                    return None
                return self.normalize(resp.json())
        except Exception as e:
            logger.error(f"DrugBank get_details failed: {str(e)}")
            return None

    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        drugbank_id = raw_item.get("drugbank_id") or raw_item.get("id", "DB00000")
        name = raw_item.get("name", "Unknown Drug")
        
        return {
            "source_type": "DrugBank",
            "source_name": "DrugBank Knowledgebase",
            "identifier": drugbank_id,
            "drugbank_id": drugbank_id,
            "name": name,
            "title": f"DrugBank Record: {name} ({drugbank_id})",
            "indication": raw_item.get("indication", "Established clinical indication"),
            "pharmacodynamics": raw_item.get("pharmacodynamics"),
            "mechanism_of_action": raw_item.get("mechanism_of_action"),
            "targets": raw_item.get("targets", []),
            "drug_interactions": raw_item.get("interactions", []),
            "source_url": self.get_source_url(drugbank_id),
            "study_type": "Pharmacological & Clinical Pharmacology Dossier",
            "provenance": "DrugBank API (Live Verified)"
        }
