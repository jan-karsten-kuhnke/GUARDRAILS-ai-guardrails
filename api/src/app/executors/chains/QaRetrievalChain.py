import json
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

from typing import Any
import logging


class QaRetrievalChain:
    
    def execute(self, query, is_private, chat_history):
        embeddings = HuggingFaceEmbeddings()
        db = Chroma(
            persist_directory=Globals.persist_directory, embedding_function=embeddings
        )
        # https://python.langchain.com/docs/modules/data_connection/retrievers/how_to/vectorstore
        # retriever = db.as_retriever()
        retriever = db.as_retriever()

        llm=LlmProvider.get_llm(is_private=is_private, use_chat_model=True, max_output_token=1000, increase_model_token_limit=False)
 
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
        return {"answer":answer,"sources": sources}