from globals import Globals
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain import OpenAI
from langchain.llms import VertexAI
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
from langchain.docstore.document import Document
from executors.utils.LlmProvider import LlmProvider
from database.repository import Persistence
from executors.utils.AppletResponse import AppletResponse
import logging,time
from utils.util import log

class Summarize:
    
    def execute(self,filepath,document_array,is_document_uploaded, params):
        
        start_time = time.time()
        model_type = params['modelType']
        map_prompt_template = params['mapPromptTemplate']
        reduce_prompt_template = params['reducePromptTemplate']
        chain_type = params['chainType']
        chung_config=params['chunk_config']
        chunk_overlap = chung_config['chunkOverlap']
        chunk_size = chung_config['chunkSize']
        
        llm=LlmProvider.get_llm(class_name= __class__.__name__,model_type=model_type, is_private=False, use_chat_model=False, max_output_token=1000, increase_model_token_limit=False)
            
        docs=[]
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        if is_document_uploaded:
            docs=text_splitter.create_documents(document_array)
        else:
            loader = PyPDFLoader(filepath)
            pages = loader.load_and_split()
            docs = text_splitter.split_documents(pages)

        str_doc = ""
        for doc in docs:
            str_doc += doc.page_content
        
        new_doc =Document(
                            page_content=str_doc,
                            metadata={"source": filepath, "page": 0},
                        )
        docs = text_splitter.split_documents([new_doc])
        
        MAP_PROMPT = PromptTemplate(template=map_prompt_template, input_variables=["text"])
        REDUCE_PROMPT = PromptTemplate(template=reduce_prompt_template, input_variables=["text"])
        chain = load_summarize_chain(llm, chain_type=chain_type,  map_prompt=MAP_PROMPT, combine_prompt=REDUCE_PROMPT,verbose=True)
        result = chain({"input_documents": docs}, return_only_outputs=True)
        
        response=AppletResponse(result["output_text"], [])
        execution_time = round(time.time() - start_time,2)
        logging.info(log(__class__.__name__,"Execution Time (s): ", execution_time))
        return response.obj()


