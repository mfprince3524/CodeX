from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "BioMindQ"
    TAGLINE: str = "Biomedical Intelligence. Grounded in Evidence."
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./biomindq.db"
    
    # Biomedical External APIs
    PUBMED_BASE_URL: str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    NCBI_API_KEY: Optional[str] = None
    NCBI_EMAIL: str = "researcher@biomindq.org"
    NCBI_TOOL: str = "BioMindQ"
    
    CHEMBL_BASE_URL: str = "https://www.ebi.ac.uk/chembl/api/data"
    
    CLINICALTRIALS_BASE_URL: str = "https://clinicaltrials.gov/api/v2"
    
    # DrugBank Integration (Configurable via env var)
    DRUGBANK_API_KEY: Optional[str] = None
    DRUGBANK_BASE_URL: str = "https://api.drugbank.com/v1"
    
    # AI LLM Provider for Synthesis (Optional OpenAI / Gemini / Claude API key)
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    # Cache and Rate Limiting
    ENABLE_CACHE: bool = True
    CACHE_TTL_SECONDS: int = 3600
    REQUEST_TIMEOUT_SECONDS: float = 12.0
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
