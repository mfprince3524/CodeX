import httpx
from typing import List, Dict, Any, Optional
import xml.etree.ElementTree as ET
from app.integrations.base import BaseAdapter
from app.core.config import settings
from app.core.logging import logger

class PubMedAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(name="PubMed")
        self.base_url = settings.PUBMED_BASE_URL
        self.email = settings.NCBI_EMAIL
        self.tool = settings.NCBI_TOOL
        self.api_key = settings.NCBI_API_KEY
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS

    def _get_params(self, extra: Dict[str, Any]) -> Dict[str, Any]:
        params = {
            "email": self.email,
            "tool": self.tool,
            "retmode": "json",
        }
        if self.api_key:
            params["api_key"] = self.api_key
        params.update(extra)
        return params

    def get_source_url(self, identifier: str) -> str:
        return f"https://pubmed.ncbi.nlm.nih.gov/{identifier}/"

    async def search(self, query: str, limit: int = 8, **kwargs) -> List[Dict[str, Any]]:
        search_url = f"{self.base_url}/esearch.fcgi"
        params = self._get_params({
            "db": "pubmed",
            "term": query,
            "retmax": limit,
            "sort": "relevance",
        })
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(search_url, params=params)
                if resp.status_code != 200:
                    logger.warning(f"PubMed search returned status {resp.status_code} for query '{query}'")
                    return []
                
                data = resp.json()
                id_list = data.get("esearchresult", {}).get("idlist", [])
                if not id_list:
                    return []
                
                return await self.get_summaries(id_list)
        except Exception as e:
            logger.error(f"PubMed search failed: {str(e)}")
            return []

    async def get_summaries(self, id_list: List[str]) -> List[Dict[str, Any]]:
        if not id_list:
            return []
        
        summary_url = f"{self.base_url}/esummary.fcgi"
        params = self._get_params({
            "db": "pubmed",
            "id": ",".join(id_list),
        })
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(summary_url, params=params)
                if resp.status_code != 200:
                    return []
                
                data = resp.json()
                results = []
                result_dict = data.get("result", {})
                
                for uid in id_list:
                    if uid in result_dict:
                        raw = result_dict[uid]
                        normalized = self.normalize(raw)
                        results.append(normalized)
                        
                return results
        except Exception as e:
            logger.error(f"PubMed summaries fetch failed: {str(e)}")
            return []

    async def get_details(self, identifier: str) -> Optional[Dict[str, Any]]:
        results = await self.get_summaries([identifier])
        return results[0] if results else None

    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        uid = str(raw_item.get("uid", ""))
        title = raw_item.get("title", "Untitled Biomedical Study")
        # Strip trailing period or formatting
        title = title.rstrip(".")
        
        # Authors parsing
        authors = []
        for author in raw_item.get("authors", []):
            if isinstance(author, dict) and "name" in author:
                authors.append(author["name"])
            elif isinstance(author, str):
                authors.append(author)
                
        pub_date = raw_item.get("pubdate", "")
        year = None
        if pub_date:
            parts = pub_date.split()
            for part in parts:
                if part.isdigit() and len(part) == 4:
                    year = int(part)
                    break
                    
        journal = raw_item.get("source", raw_item.get("fulljournalname", "Peer-Reviewed Journal"))
        
        # Article IDs (DOI)
        doi = None
        for aid in raw_item.get("articleids", []):
            if isinstance(aid, dict) and aid.get("idtype") == "doi":
                doi = aid.get("value")
                break
                
        # Determine study type heuristics
        pub_types = raw_item.get("pubtype", [])
        study_type = "Preclinical / Mechanistic Investigation"
        if any("Clinical Trial" in pt or "Randomized" in pt for pt in pub_types):
            study_type = "Randomized Controlled Clinical Trial"
        elif any("Review" in pt or "Systematic Review" in pt for pt in pub_types):
            study_type = "Systematic Review & Meta-Analysis"
        elif any("Meta-Analysis" in pt for pt in pub_types):
            study_type = "Quantitative Meta-Analysis"
        elif any("Observational" in pt or "Cohort" in pt for pt in pub_types):
            study_type = "Observational Cohort Study"
            
        return {
            "source_type": "PubMed",
            "source_name": "NCBI PubMed / MEDLINE",
            "identifier": uid,
            "pmid": uid,
            "doi": doi,
            "title": title,
            "authors": authors[:5] + (["et al."] if len(authors) > 5 else []),
            "journal": journal,
            "publication_date": pub_date,
            "year": year or 2023,
            "study_type": study_type,
            "source_url": self.get_source_url(uid),
            "evidence_excerpt": raw_item.get("sorttitle", title),
            "relevance_score": 0.88,
            "why_it_matters": f"Published in {journal}, establishing primary evidence for target mechanisms and clinical efficacy."
        }
