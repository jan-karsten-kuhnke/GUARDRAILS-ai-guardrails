from sqlalchemy import Column, Integer, String, Text,MetaData,Boolean, TIMESTAMP
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from globals import Globals

metadata_obj = MetaData(schema=Globals.vector_store_pg_schema)
Vector_Base = declarative_base(metadata=metadata_obj)


class CollectionEntity(Vector_Base):
    __tablename__ = 'langchain_pg_collection'
    uuid = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name =  Column(String(255))
    
    def to_dict(self):
        return {
            'uuid': str(self.uuid),
            'name': self.name
        }