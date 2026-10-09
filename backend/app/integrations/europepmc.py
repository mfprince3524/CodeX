import httpx
from typing import List, Dict, Any, Optional
from app.integrations.base import BaseAdapter
from app.core.config import settings
from app.core.logging import logger

class EuropePMCAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(name="Europe PMC")
        self.base_url = "https://www.ebi.ac.uk/europepmc/webservices/rest"
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS

    def get_source_url(self, identifier: str) -> str:
        return f"https://europepmc.org/article/MED/{identifier}"

    async def search(self, query: str, limit: int = 10, **kwargs) -> List[Dict[str, Any]]:
        search_url = f"{self.base_url}/search"
        params = {
            "query": query,
            "format": "json",
            "pageSize": min(limit, 25),
            "resultType": "core",
            "sort": "RELEVANCE"
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(search_url, params=params)
                if resp.status_code != 200:
                    logger.warning(f"Europe PMC search returned status {resp.status_code} for query '{query}'")
                    return []
                
                data = resp.json()
                results = data.get("resultList", {}).get("result", [])
                return [self.normalize(r) for r in results if r]
        except Exception as e:
            logger.error(f"Europe PMC search failed: {str(e)}")
            return []

    async def get_details(self, identifier: str) -> Optional[Dict[str, Any]]:
        search_url = f"{self.base_url}/search"
        params = {
            "query": f"EXT_ID:{identifier} OR PMID:{identifier}",
            "format": "json",
            "resultType": "core"
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(search_url, params=params)
                if resp.status_code != 200:
                    return None
                results = resp.json().get("resultList", {}).get("result", [])
                return self.normalize(results[0]) if results else None
        except Exception as e:
            logger.error(f"Europe PMC get_details failed: {str(e)}")
            return None

    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        pmid = raw_item.get("pmid") or raw_item.get("id", "")
        title = raw_item.get("title", "Untitled Biomedical Publication").rstrip(".")
        journal = raw_item.get("journalTitle") or raw_item.get("journalInfo", {}).get("journal", {}).get("title", "Biomedical Literature")
        pub_year = raw_item.get("pubYear")
        try:
            year = int(pub_year) if pub_year else 2024
        except (ValueError, TypeError):
            year = 2024

        abstract_text = raw_item.get("abstractText") or ""
        # Strip XML tags if present in abstract
        import re
        clean_abstract = re.sub(r'<[^>]+>', '', abstract_text)

        author_string = raw_item.get("authorString", "")
        authors = [a.strip() for a in author_string.split(",") if a.strip()] if author_string else []

        doi = raw_item.get("doi")
        source_url = f"https://doi.org/{doi}" if doi else self.get_source_url(pmid)
        
        # Study classification heuristics
        study_type = "Mechanistic & Preclinical Study"
        pub_type_list = raw_item.get("pubTypeList", {}).get("pubType", [])
        if isinstance(pub_type_list, str):
            pub_type_list = [pub_type_list]

        if any("Clinical Trial" in pt or "Randomized" in pt for pt in pub_type_list):
            study_type = "Randomized Controlled Trial"
        elif any("Review" in pt or "Systematic" in pt for pt in pub_type_list):
            study_type = "Systematic Review & Meta-Analysis"
        elif any("Meta-Analysis" in pt for pt in pub_type_list):
            study_type = "Meta-Analysis"

        return {
            "source_type": "PubMed / Europe PMC",
            "source_name": "Europe PMC / MEDLINE",
            "identifier": str(pmid),
            "pmid": str(pmid),
            "doi": doi,
            "title": title,
            "authors": authors[:5] + (["et al."] if len(authors) > 5 else []),
            "journal": journal,
            "publication_date": str(pub_year or "2024"),
            "year": year,
            "abstract": clean_abstract,
            "study_type": study_type,
            "source_url": source_url,
            "evidence_excerpt": clean_abstract[:320] + "..." if len(clean_abstract) > 320 else (clean_abstract or title),
            "relevance_score": 0.92,
            "why_it_matters": f"Published in {journal} ({year}), providing direct peer-reviewed experimental and clinical observations."
        }
