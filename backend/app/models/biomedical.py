from sqlalchemy import Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ResearchSessionModel(Base):
    __tablename__ = "research_sessions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    query_text = Column(Text, nullable=False)
    focus = Column(String(100), default="All")
    timeframe = Column(String(50), default="All")
    evidence_type = Column(String(50), default="All")
    is_demo = Column(Boolean, default=False)
    agreement_status = Column(String(50), default="Mostly Consistent")
    confidence_score = Column(Float, default=0.85)
    synthesis_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PublicationModel(Base):
    __tablename__ = "publications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    pmid = Column(String(50), index=True, nullable=True)
    doi = Column(String(100), index=True, nullable=True)
    title = Column(Text, nullable=False)
    abstract = Column(Text, nullable=True)
    journal = Column(String(255), nullable=True)
    publication_date = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True)
    authors_json = Column(JSON, default=list)
    source_url = Column(String(500), nullable=False)
    study_type = Column(String(100), default="Observational")
    created_at = Column(DateTime, default=datetime.utcnow)

class CompoundModel(Base):
    __tablename__ = "compounds"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), index=True, nullable=False)
    chembl_id = Column(String(50), index=True, nullable=True)
    drugbank_id = Column(String(50), index=True, nullable=True)
    smiles = Column(Text, nullable=True)
    molecular_formula = Column(String(100), nullable=True)
    molecular_weight = Column(Float, nullable=True)
    drug_type = Column(String(100), default="Small molecule")
    mechanism_of_action = Column(Text, nullable=True)
    targets_json = Column(JSON, default=list)
    indications_json = Column(JSON, default=list)
    provenance = Column(String(255), default="EMBL-EBI ChEMBL")
    created_at = Column(DateTime, default=datetime.utcnow)

class DiseaseModel(Base):
    __tablename__ = "diseases"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), index=True, nullable=False)
    mesh_id = Column(String(50), index=True, nullable=True)
    category = Column(String(100), nullable=False)
    overview = Column(Text, nullable=False)
    pathophysiology = Column(Text, nullable=False)
    key_targets_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class ClinicalTrialModel(Base):
    __tablename__ = "clinical_trials"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    nct_id = Column(String(50), index=True, unique=True, nullable=False)
    title = Column(Text, nullable=False)
    status = Column(String(100), nullable=False)
    phase = Column(String(50), nullable=True)
    condition = Column(String(255), nullable=False)
    intervention = Column(String(255), nullable=False)
    sponsor = Column(String(255), nullable=False)
    study_type = Column(String(100), default="Interventional")
    start_date = Column(String(50), nullable=True)
    completion_date = Column(String(50), nullable=True)
    source_url = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class CollectionModel(Base):
    __tablename__ = "collections"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(50), default="#0A5BFF")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    items = relationship("CollectionItemModel", back_populates="collection", cascade="all, delete-orphan")

class CollectionItemModel(Base):
    __tablename__ = "collection_items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    collection_id = Column(String(36), ForeignKey("collections.id", ondelete="CASCADE"), nullable=False)
    item_type = Column(String(50), nullable=False)  # "query", "paper", "compound", "disease", "trial"
    title = Column(String(255), nullable=False)
    reference_id = Column(String(255), nullable=False)
    metadata_json = Column(JSON, default=dict)
    notes = Column(Text, nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    collection = relationship("CollectionModel", back_populates="items")
