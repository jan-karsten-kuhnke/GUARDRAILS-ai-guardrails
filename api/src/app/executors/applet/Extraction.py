from globals import Globals
from langchain.vectorstores.pgvector import PGVector
from langchain.document_loaders import PyPDFLoader
from langchain.chat_models import ChatOpenAI, ChatVertexAI
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.summarize import load_summarize_chain
from executors.utils.LlmProvider import LlmProvider
from database.repository import Persistence
from langchain.chat_models import ChatOpenAI
from langchain.chains import create_extraction_chain
from langchain.chains import LLMChain
from langchain.chains.question_answering import load_qa_chain
import json,time,logging
from executors.utils.AppletResponse import AppletResponse
from utils.util import log
from langchain.chains import ConversationalRetrievalChain
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate

class Extraction:

    def execute(self,filepath,document_array,is_document_uploaded, params):
        start_time = time.time()
        model_type = params['modelType']

        embeddings = HuggingFaceEmbeddings()
        
        CONNECTION_STRING =Globals.VECTOR_STORE_DB_URI
        COLLECTION_NAME = params['collection_name']

        store = PGVector(
            collection_name=COLLECTION_NAME,
            connection_string=CONNECTION_STRING,
            embedding_function=embeddings,
        )
                
        llm = LlmProvider.get_llm(class_name= __class__.__name__,model_type=model_type, is_private=False, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)

        propertiesArray = params['properties']
        properties = ",".join(propertiesArray)   
        query =  params['inputQuery']
        query = query.replace("_properties_",properties)
        docs = store.similarity_search(query)
                
        prompt = params['promptTemplate']
        context_content = " ".join([doc.page_content for doc in docs])

        PROMPT = PromptTemplate(
        input_variables=["context_content"], template= prompt
        )
        
        chain = LLMChain(
            llm=llm,
            verbose=True,
            prompt=PROMPT
        )
        
        answer = chain.predict(context_content=context_content)
     
        response=AppletResponse(answer, [])
        execution_time = round(time.time() - start_time,2)
        logging.info(log(__class__.__name__,"Execution Time (s): ", execution_time))
        return response.obj()
