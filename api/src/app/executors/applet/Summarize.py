from globals import Globals
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain import OpenAI
from langchain.llms import VertexAI
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
from executors.utils.LlmProvider import LlmProvider
from database.repository import Persistence
from executors.utils.AppletResponse import AppletResponse

class Summarize:

    def execute(self,filepath):
        
        chain = Persistence.get_chain_by_code('summarize-brief')
        params = chain['params']
        
        map_prompt_template = params['mapPromptTemplate']
        reduce_prompt_template = params['reducePromptTemplate']
        chain_type = params['chainType']
        
        llm=LlmProvider.get_llm(is_private=False, use_chat_model=False, max_output_token=1000, increase_model_token_limit=False)
        
        loader = PyPDFLoader(filepath)
        pages = loader.load_and_split()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        docs = text_splitter.split_documents(pages)

        MAP_PROMPT = PromptTemplate(template=map_prompt_template, input_variables=["text"])
        REDUCE_PROMPT = PromptTemplate(template=reduce_prompt_template, input_variables=["text"])
        chain = load_summarize_chain(llm, chain_type=chain_type,  map_prompt=MAP_PROMPT, combine_prompt=REDUCE_PROMPT,verbose=True)
        result = chain({"input_documents": docs}, return_only_outputs=True)
        
        response=AppletResponse(result["output_text"], [])

        return response.obj()


