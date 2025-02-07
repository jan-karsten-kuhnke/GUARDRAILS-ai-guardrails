import glob
import os
import logging
from typing import List
from langchain import OpenAI
from langchain.chains.summarize import load_summarize_chain
from langchain.document_loaders import (
    CSVLoader,
    EverNoteLoader,
    PyPDFLoader,
    TextLoader,
    UnstructuredEPubLoader,
    UnstructuredHTMLLoader,
    UnstructuredMarkdownLoader,
    UnstructuredODTLoader,
    UnstructuredPowerPointLoader,
    UnstructuredWordDocumentLoader,
)

from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from globals import Globals
from database.models import DocumentEntity
from database.postgres import Session
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores.pgvector import PGVector

from service.document_ai_loader import DocumentAILoader 

chunk_size = Globals.chunk_size
chunk_overlap = Globals.chunk_overlap



FILE_MAPPING = {
    ".csv": (CSVLoader, {}),
    ".doc": (UnstructuredWordDocumentLoader, {}),
    ".docx": (UnstructuredWordDocumentLoader, {}),
    ".enex": (EverNoteLoader, {}),
    ".epub": (UnstructuredEPubLoader, {}),
    ".html": (UnstructuredHTMLLoader, {}),
    ".md": (UnstructuredMarkdownLoader, {}),
    ".odt": (UnstructuredODTLoader, {}),
    ".ppt": (UnstructuredPowerPointLoader, {}),
    ".pptx": (UnstructuredPowerPointLoader, {}),
    ".txt": (TextLoader, {"encoding": "utf8"}),
}

class  IngestionService :
    def ingest_file(self,file_path: str,collection_name,uploaded_by,uploaded_at,ingest_with_google = False, metadata={}):
        embeddings = HuggingFaceEmbeddings()

        CONNECTION_STRING = Globals.VECTOR_STORE_DB_URI
        COLLECTION_NAME = collection_name

        document = IngestionService.load_document(file_path, ingest_with_google)
        texts = IngestionService.process_document(document,uploaded_by,uploaded_at,metadata)
    
        store = PGVector(
            collection_name=COLLECTION_NAME,
            connection_string=CONNECTION_STRING,
            embedding_function=embeddings,
        )

        custom_ids = store.add_documents(texts)

        return custom_ids

    
    def load_document(file_path: str, ingest_with_google: bool) -> List[Document]:
        ext = os.path.splitext(file_path)[1]
        loader = None

        if ext == ".pdf":
            if ingest_with_google:
                loader_class, loader_args = DocumentAILoader, {}
                loader = loader_class(file_path, Globals.project_id, Globals.processor_id, Globals.ocr_processor_id,**loader_args)
            else:
                loader_class, loader_args = PyPDFLoader, {}
                loader = loader_class(file_path, **loader_args)
        elif ext in FILE_MAPPING:
            loader_class, loader_args = FILE_MAPPING[ext]
            loader = loader_class(file_path, **loader_args)
        else:
            raise ValueError(f"Unsupported file type '{ext}'")
    
        return loader.load()


    def get_all_documents(directory: str) -> List[Document]:
        documents = []
        for root, _, files in os.walk(directory):
            for file in files:
                file_path = os.path.join(root, file)
                documents.append({"file_name":file,"file_path":file_path})
        return documents


    def process_document(document: list,uploaded_by,uploaded_at,metadata) -> List[Document]:
        if not document:
            logging.info("No document found")
            exit(0)
            
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        texts = text_splitter.split_documents(document)

        for text in texts:
            text.metadata['source'] = text.metadata['source'].split( '/')[-1].split('\\')[-1]
            text.metadata['uploaded_by'] = uploaded_by
            text.metadata['uploaded_at'] = uploaded_at
            if len(metadata) != 0:
                for key,val in metadata.items():
                    text.metadata[key] = val


        logging.info(f"Split into {len(texts)} chunks of text (max. {chunk_size} tokens each)")
        #Summarize each document
        #TODO:start a background thread for each document
        # for doc in documents:
        #     try:
        #         session = Session()
        #         doc_text = text_splitter.split_documents([doc])
        #         doc_summary = IngestionService.summarize(doc_text)
        #         document = session.query(DocumentEntity).filter(DocumentEntity.location == doc.dict()['metadata']['source']).first()
        #         document.description = doc_summary
        #         session.commit()
        #     except Exception as e:
        #         logging.info(e)
        return texts
    

    def calculate_embeddings(texts: List[str]) -> List[List[float]]:
        embeddings = HuggingFaceEmbeddings()
        return embeddings.embed(texts)
    
    def calculate_similarity(texts: List[str]) -> List[List[float]]:
        embeddings = HuggingFaceEmbeddings()
        return embeddings.similarity(texts)
    
    def keyphrase_extraction(texts: List[str]) -> List[List[str]]:
        # keyword extraction skill
        return "Hello World"
    
    def entity_detection(texts: List[str]) -> List[List[str]]:
        # entity detection skill
        return "Hello World"
    
    def summarize(texts: List[str]) ->str:
        # summarization skill
        llm = OpenAI(temperature=0)
        chain = load_summarize_chain(llm, chain_type="map_reduce")
        res = chain.run(texts)
        return res
        
    
    def sentiment_analysis(texts: List[str]) -> List[str]:
        # sentiment analysis skill
        return "Hello World"
    
    def translate(texts: List[str]) -> List[str]:
        # translation skill
        return "Hello World"

    def does_vectorstore_exist(persist_directory: str) -> bool:
        """
        Checks if vectorstore exists
        """
        if os.path.exists(os.path.join(persist_directory, 'index')):
            if os.path.exists(os.path.join(persist_directory, 'chroma-collections.parquet')) and os.path.exists(os.path.join(persist_directory, 'chroma-embeddings.parquet')):
                list_index_files = glob.glob(os.path.join(persist_directory, 'index/*.bin'))
                list_index_files += glob.glob(os.path.join(persist_directory, 'index/*.pkl'))
                # At least 3 documents are needed in a working vectorstore
                if len(list_index_files) > 3:
                    return True
        return False