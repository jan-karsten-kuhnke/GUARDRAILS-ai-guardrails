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
from utils.util import utils

class QaRetrieval:
    @classmethod
    def get_class_name(cls):
        return cls.__name__

    def execute(self, query, is_private, chat_history,collection_name, params):
        start_time = time.time()
        model_type = params['modelType']


        embeddings = HuggingFaceEmbeddings()
        
        CONNECTION_STRING =Globals.VECTOR_STORE_DB_URI
        COLLECTION_NAME = collection_name
        
        store = PGVector(
            collection_name=COLLECTION_NAME,
            connection_string=CONNECTION_STRING,
            embedding_function=embeddings,
        )
        
        retriever = store.as_retriever()
        
        llm=LlmProvider.get_llm(class_name= self.get_class_name(),model_type=model_type, is_private=is_private, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)

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
        logging.info(utils.logging_info(self.get_class_name(),"Execution Time (s): ", execution_time))
        return response.obj()
