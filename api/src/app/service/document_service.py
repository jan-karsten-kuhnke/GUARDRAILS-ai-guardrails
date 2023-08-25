from flask import jsonify
from database.models import DocumentEntity
from database.postgres import session
from service.ingestion_service import IngestionService
from database.repository import Persistence
from sqlalchemy import func ,or_,and_
import logging

class DocumentService:
    def create_document(filename, filepath, description=""):
        try:
            ingestion_service = IngestionService()
            custom_ids = ingestion_service.ingest_file(filepath)
            Persistence.insert_document(filename, filepath, custom_ids, description)

        except Exception as ex:
            logging.error(f"Exception uploading document: {ex}")

    
    def create_documents(location,collection_name):
        try:
            ingestion_service = IngestionService()
            files = IngestionService.get_all_documents(location)

            for file in files:
                custom_ids = ingestion_service.ingest_file(file["file_path"], collection_name)
                Persistence.insert_document(file['file_name'], file["file_path"], custom_ids, collection_name)

            return jsonify({"success":True,"message":"Successfully uploaded documents"}),200
        except Exception as ex:
            logging.error(f"Exception uploading documents: {ex}")
            return jsonify({"success":False,"message":"Failed to upload documents"}),500

    def get_documents(Entity,sort, range_, filter_,collection):
        return Persistence.get_list_query(Entity, sort, range_, filter_,collection)
        
    def get_document(Entity,document_id):
        return Persistence.get_one_query(Entity, document_id)
    
    def update_document(document_id, title, description, location, folder_id):
        return Persistence.update_document(document_id, title, description, location, folder_id)
    
    def delete_document(document_id):
        return Persistence.delete_document(document_id)

    def add_collection_for_doc(collection_name):
        return Persistence.add_collection(collection_name)    
    
    def get_collections():
        return Persistence.get_collections()  
    
    def get_documents_by_collection_name(collection_name):
        return Persistence.get_documents_by_collection_name(collection_name)  
    