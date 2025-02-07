from sqlalchemy import Column, Integer, String, Text,MetaData,Boolean, TIMESTAMP
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from globals import Globals

metadata_obj = MetaData(schema=Globals.pg_schema)
Base = declarative_base(metadata=metadata_obj)

class PredefinedRuleEntity(Base):
    __tablename__ = 'predefined_rules'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(255))
    provider = Column(String(255))
    is_active = Column(Boolean)
    details = Column(String(255))
    criticality = Column(String(255))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'provider': self.provider,
            'is_active': self.is_active,
            'details': self.details,
            'criticality': self.criticality
        }


class ChatLogEntity(Base):
    __tablename__ = 'chat_log'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    created_at = Column(TIMESTAMP, server_default=func.now())
    user_id = Column(Text)
    text = Column(Text)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'created_at': self.created_at,
            'user_id': self.user_id,
            'text': self.text
        }


class AnonymizeAuditEntity(Base):
    __tablename__ = 'anonymize_audit'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    original_text = Column(Text)
    anonymized_text = Column(Text)
    flagged_text = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    user_id = Column(Text)
    analysed_entity = Column(Text)
    criticality = Column(Text)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'original_text': self.original_text,
            'anonymized_text': self.anonymized_text,
            'flagged_text': self.flagged_text,
            'created_at': self.created_at,
            'user_id': self.user_id,
            'analysed_entity': self.analysed_entity,
            'criticality': self.criticality
        }


class AnalysisAuditEntity(Base):
    __tablename__ = 'analysis_audit'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    text = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    user_id = Column(Text)
    flagged_text = Column(Text)
    analysed_entity = Column(Text)
    criticality = Column(Text)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'text': self.text,
            'created_at': self.created_at,
            'user_id': self.user_id,
            'flagged_text': self.flagged_text,
            'analysed_entity': self.analysed_entity,
            'criticality': self.criticality
        }


class CustomRuleEntity(Base):
    __tablename__ = 'custom_rules'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(255))
    type = Column(String(255))
    value = Column(String(255))
    created_at = Column(TIMESTAMP)
    criticality = Column(String(255))
    is_active = Column(Boolean)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'type': self.type,
            'value': self.value,
            'created_at':self.created_at,
            'criticality':self.criticality,
            'is_active':self.is_active
        }

class OrganisationEntity(Base):
    __tablename__ = 'organisation'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(255))
    email = Column(String(255))
    details = Column(Text)
    openai_key = Column(String(255))
    created_at = Column(TIMESTAMP)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'email': self.email,
            'details': self.details,
            'openai_key': self.openai_key,
            'created_at': self.created_at
        }

class DocumentEntity(Base):
    __tablename__ = 'documents'
    id = Column(Integer(), primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    location = Column(String())
    custom_ids = Column(ARRAY(String))
    collection_name = Column(String())
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'custom_ids': self.custom_ids,
            'collection_name':self.collection_name
        }
    

class ChainEntity(Base):
    __tablename__ = 'chain'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    title = Column(String(100), nullable=False)
    icon = Column(String(100), nullable=False)
    code = Column(String(100), nullable=False)
    group_code = Column(String(100), nullable=True)
    params = Column(JSONB, nullable=False)
    is_active = Column(Boolean, nullable=False)

    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'icon': self.icon,
            'code': self.code,
            'group_code': self.group_code,
            'params': self.params,
            'is_active': self.is_active
        }
        
class FolderEntity(Base):
    __tablename__ = 'folders'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id = Column(String(255))
    folders = Column(ARRAY(JSONB))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': self.user_id,
            'folders': self.folders
        }
        
        
class PromptEntity(Base):
    __tablename__ = 'prompts'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id = Column(String(255))
    prompts = Column(ARRAY(JSONB))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': self.user_id,
            'prompts': self.prompts
        }
        
        
class EulaEntity(Base):
    __tablename__ = 'eula'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id = Column(String(255))
    eula= Column(Boolean)
    eula_accepted_on = Column(TIMESTAMP, server_default=func.now())
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': self.user_id,
            'eula': self.eula,
            'eula_accepted_on': self.eula_accepted_on,
        }


class DataSourceEntity(Base):
    __tablename__ = 'data_source'
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(255))
    connection_string = Column(Text)
    schemas = Column(ARRAY(String))
    tables_to_include = Column(ARRAY(String))
    custom_schema_description = Column(Text)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'connection_string': self.connection_string,
            'schemas': self.schemas,
            'tables_to_include': self.tables_to_include,
            'custom_schema_description': self.custom_schema_description
        }


class AclEntity(Base):
    __tablename__ = 'acl'
    id=Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    entity_type=Column(String(255))
    entity_id=Column(UUID(as_uuid=True))
    gid=Column(ARRAY(String))
    rid=Column(ARRAY(String))
    uid=Column(ARRAY(String))
    owner=Column(String(255))

    def to_dict(self):
        return {
            'id': str(self.id),
            'entity_type': self.entity_type,
            'entity_id': str(self.entity_id),
            'gid': self.gid,
            'rid': self.rid,
            'uid': self.uid,
            'owner': self.owner
        }