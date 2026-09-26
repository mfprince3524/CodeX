from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseAdapter(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    async def search(self, query: str, limit: int = 10, **kwargs) -> List[Dict[str, Any]]:
        """Search the external biomedical resource and return raw results."""
        pass

    @abstractmethod
    async def get_details(self, identifier: str) -> Optional[Dict[str, Any]]:
        """Fetch detailed record by primary accession/ID."""
        pass

    @abstractmethod
    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize external entity into unified BioMindQ schema format."""
        pass

    @abstractmethod
    def get_source_url(self, identifier: str) -> str:
        """Construct canonical web URL for source verification."""
        pass
