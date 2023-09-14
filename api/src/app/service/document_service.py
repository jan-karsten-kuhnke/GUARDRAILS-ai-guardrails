from flask import jsonify
from database.models import DocumentEntity
from service.ingestion_service import IngestionService
from database.repository import Persistence
from sqlalchemy import func ,or_,and_
import logging
from oidc import get_current_user_id

class DocumentService:
    def create_document(filename, filepath,task_params,uploaded_by,uploaded_at,description=""):
        try:
            collection_name = task_params['collectionName']
            ingestion_service = IngestionService()
            custom_ids = ingestion_service.ingest_file(filepath,collection_name,uploaded_by,uploaded_at)
            Persistence.insert_document(filename, filepath, custom_ids,collection_name=collection_name)

        except Exception as ex:
            logging.error(f"Exception uploading document: {ex}")

    
    def create_documents(location,collection_name,uploaded_by,uploaded_at,ingest_with_google,metadata):
        try:
            ingestion_service = IngestionService()
            files = IngestionService.get_all_documents(location)

            for file in files:
                custom_ids = ingestion_service.ingest_file(file["file_path"], collection_name,uploaded_by,uploaded_at,ingest_with_google, metadata)
                Persistence.insert_document(file['file_name'], file["file_path"], custom_ids, collection_name)

            return jsonify({"success":True,"message":"Successfully uploaded documents"}),200
        except Exception as ex:
            logging.error(f"Exception uploading documents: {ex}")
            return jsonify({"success":False,"message":"Failed to upload documents"}),500

    def get_documents(Entity,sort, range_, filter_,collection):
        return Persistence.get_list_query(Entity, sort, range_, filter_,collection)
        
    def get_document(Entity,document_id):
        return Persistence.get_one_query(Entity, document_id)
    
    def update_document(document_id, title, description, location, collection_name):
        return Persistence.update_document(document_id, title, description, location, collection_name)
    
    def delete_document(document_id):
        return Persistence.delete_document(document_id)

    def add_collection_for_doc(collection_name):
        return Persistence.add_collection(collection_name)    
    
    def get_collections():
        return Persistence.get_collections()  
    
    def get_documents_by_collection_name(collection_name):
        return Persistence.get_documents_by_collection_name(collection_name)  
    