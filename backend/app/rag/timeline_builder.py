from typing import List, Dict, Any
from app.schemas.biomedical import ResearchTimelineEvent

class TimelineBuilder:
    @staticmethod
    def build_timeline(citations: List[Dict[str, Any]], trials: List[Dict[str, Any]]) -> List[ResearchTimelineEvent]:
        events: List[ResearchTimelineEvent] = []
        
        # Chronological milestones for biomedical research
        # Integrate citations
        for cite in citations:
            year = cite.get("year", 2022)
            events.append(ResearchTimelineEvent(
                id=f"tl-cite-{cite.get('id', year)}",
                year=year,
                date_str=cite.get("publication_date", f"{year}-01"),
                title=cite.get("title", "Biomedical Publication"),
                event_type="Publication / Meta-Analysis" if "Meta" in cite.get("study_type", "") else "Preclinical / Mechanism",
                summary=cite.get("evidence_excerpt", "")[:180] + "...",
                citation_marker=cite.get("marker"),
                source_name=cite.get("journal", "NCBI PubMed"),
                source_url=cite.get("source_url"),
                pmid=cite.get("pmid")
            ))
            
        # Integrate clinical trials
        for tr in trials:
            s_date = tr.get("start_date") or "2020-01"
            year = 2020
            try:
                year = int(s_date.split("-")[0])
            except (ValueError, IndexError):
                pass
                
            events.append(ResearchTimelineEvent(
                id=f"tl-trial-{tr.get('nct_id')}",
                year=year,
                date_str=s_date,
                title=f"Clinical Trial {tr.get('nct_id')}: {tr.get('phase', 'Phase 2')}",
                event_type=f"Clinical Trial ({tr.get('status', 'Active')})",
                summary=f"Investigating {tr.get('intervention')} for {tr.get('condition')} sponsored by {tr.get('sponsor')}.",
                citation_marker=None,
                source_name="ClinicalTrials.gov",
                source_url=tr.get("source_url"),
                pmid=None
            ))
            
        # Sort chronologically
        events.sort(key=lambda x: (x.year, x.date_str))
        return events
