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

        if is_document_uploaded:
            loader = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
            pages = loader.create_documents(document_array)
        else: 
            loader = PyPDFLoader(filepath)
            pages = loader.load()
            
        input_text = ''
        for page in pages:
            input_text += page.page_content

        embeddings = HuggingFaceEmbeddings()
        
        CONNECTION_STRING =Globals.VECTOR_STORE_DB_URI
        # COLLECTION_NAME = params['collection_name']
        
        # schema = {
        #     "properties": {
        #         "project_site_area": {"type": "string"},
        #         "project_maximum_building_height": {"type": "string"},
        #         "project_gross_plot_ratio": {"type": "string"},
        #         "flat_data_type": {"type": "string"},
        #         "flat_data_flat_type": {"type": "string"},
        #         "flat_data_ifa": {"type": "string"},
        #         "flat_data_flat_percentage": {"type": "string"}
        #     },
        #     "required": []
        # }

        store = PGVector(
            collection_name="new",
            connection_string=CONNECTION_STRING,
            embedding_function=embeddings,
        )
                
        llm = LlmProvider.get_llm(class_name= __class__.__name__,model_type=model_type, is_private=False, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)

        query = "Identify or calculate Building Height, Max Site Coverage, Gross Plot ratio, Road Buffer, Site setbacks and provide them in json format"
        docs = store.similarity_search(query)
        
        prompt = """You are an Building quality assistant.
        Strictly Identify or calculate Building Height - provide value as integer, Max Site Coverage provide value in percentage, Gross Plot ratio or gross floor ratio - provide value in float, Road Buffer - provide value in meters, Site setbacks - provide value in meters and provide them in below structure, if any value is not available or you could understand send a 0

        Sentence: """"""
        {context_content}
        """"""

        """
        
        context_content = " ".join([doc.page_content for doc in docs])
        # prompt = prompt.replace("_context_", context_content)

        PROMPT = PromptTemplate(
        input_variables=["context_content"], template= prompt
        )
        
        chain = LLMChain(
            llm=llm,
            verbose=True,
            prompt=PROMPT
        )
        
        answer = chain.predict(context_content=context_content)


        # result = chain({"question": query,"chat_history": {}})
        # answer, docs = result["answer"], result["source_documents"]
        # sources = [
        #     json.dumps(
        #         {"type": "source", "doc": doc.page_content, "metadata": doc.metadata}
        #     )
        #     for doc in docs
        # ]
      
        response=AppletResponse(answer, [])
        execution_time = round(time.time() - start_time,2)
        logging.info(log(__class__.__name__,"Execution Time (s): ", execution_time))
        return response.obj()
