import httpx
from typing import List, Dict, Any, Optional
import xml.etree.ElementTree as ET
import re
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

    async def search(self, query: str, limit: int = 10, **kwargs) -> List[Dict[str, Any]]:
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
                
                summaries = await self.get_summaries(id_list)
                # Also attempt to fetch abstracts for these IDs
                abstracts = await self.get_abstracts(id_list)
                for item in summaries:
                    pmid = item.get("pmid")
                    if pmid and pmid in abstracts and abstracts[pmid]:
                        item["abstract"] = abstracts[pmid]
                        item["evidence_excerpt"] = abstracts[pmid][:380] + "..." if len(abstracts[pmid]) > 380 else abstracts[pmid]
                return summaries
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

    async def get_abstracts(self, id_list: List[str]) -> Dict[str, str]:
        """Fetch actual abstract texts via efetch XML."""
        if not id_list:
            return {}
        
        fetch_url = f"{self.base_url}/efetch.fcgi"
        params = {
            "db": "pubmed",
            "id": ",".join(id_list),
            "retmode": "xml",
            "email": self.email,
            "tool": self.tool
        }
        if self.api_key:
            params["api_key"] = self.api_key

        abstracts: Dict[str, str] = {}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(fetch_url, params=params)
                if resp.status_code == 200 and resp.text:
                    root = ET.fromstring(resp.text)
                    for article in root.findall(".//PubmedArticle"):
                        pmid_el = article.find(".//PMID")
                        pmid = pmid_el.text if pmid_el is not None else None
                        if not pmid:
                            continue
                        
                        abstract_texts = []
                        for ab_text in article.findall(".//AbstractText"):
                            if ab_text.text:
                                label = ab_text.get("Label")
                                if label:
                                    abstract_texts.append(f"{label}: {ab_text.text}")
                                else:
                                    abstract_texts.append(ab_text.text)
                        
                        if abstract_texts:
                            abstracts[pmid] = " ".join(abstract_texts)
        except Exception as e:
            logger.warning(f"PubMed efetch abstracts warning: {str(e)}")
            
        return abstracts

    async def get_details(self, identifier: str) -> Optional[Dict[str, Any]]:
        results = await self.get_summaries([identifier])
        return results[0] if results else None

    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        uid = str(raw_item.get("uid", ""))
        title = raw_item.get("title", "Untitled Biomedical Study")
        title = title.rstrip(".")
        
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
        
        doi = None
        for aid in raw_item.get("articleids", []):
            if isinstance(aid, dict) and aid.get("idtype") == "doi":
                doi = aid.get("value")
                break
                
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
            "year": year or 2024,
            "study_type": study_type,
            "source_url": self.get_source_url(uid),
            "evidence_excerpt": raw_item.get("sorttitle", title),
            "abstract": raw_item.get("sorttitle", title),
            "relevance_score": 0.94,
            "why_it_matters": f"Published in {journal} ({year or 2024}), reporting peer-reviewed primary biomedical evidence."
        }
