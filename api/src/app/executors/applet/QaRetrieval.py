import json, time, logging
import random
from langchain import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.vectorstores import Chroma
from langchain.llms import VertexAI
from langchain.embeddings import HuggingFaceEmbeddings
from globals import Globals
from executors.utils.LlmProvider import LlmProvider
from database.repository import Persistence
from langchain.vectorstores.pgvector import PGVector
from executors.utils.AppletResponse import AppletResponse
from typing import Any
import logging
from utils.util import log

class QaRetrieval:

    def execute(self, query, is_private, chat_history, params):
        start_time = time.time()
        llm_details=params['llm']
        model_type=llm_details['model_type']
        use_chat_model=llm_details['use_chat_model']
        max_output_token=llm_details['max_output_token']
        increase_model_token_limit=llm_details['increase_model_token_limit']


        embeddings = HuggingFaceEmbeddings()
        
        CONNECTION_STRING =Globals.VECTOR_STORE_DB_URI
        COLLECTION_NAME = params['collection_name']
        
        store = PGVector(
            collection_name=COLLECTION_NAME,
            connection_string=CONNECTION_STRING,
            embedding_function=embeddings,
        )
        
        if params['is_document_selected']:
            retriever=store.as_retriever(
               search_kwargs={'filter': {'source' : params['title']}}
            )  
        else:
            retriever = store.as_retriever(
            )
        
        llm=LlmProvider.get_llm(class_name= __class__.__name__,model_type=model_type, is_private=is_private, use_chat_model=use_chat_model, max_output_token=max_output_token, increase_model_token_limit=increase_model_token_limit)

        chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            return_source_documents=True,
        )

        # Prepare the chain
       
        res = chain({"question": query, "chat_history": chat_history})
        answer, docs = res["answer"], res["source_documents"]
        sources = [
            json.dumps(
                {"type": "source", "doc": doc.page_content, "metadata": doc.metadata}
            )
            for doc in docs
        ]
        db = None
        
        response=AppletResponse(answer, sources)
        execution_time = round(time.time() - start_time,2)
        logging.info(log(__class__.__name__,"Execution Time (s): ", execution_time))
        return response.obj()
