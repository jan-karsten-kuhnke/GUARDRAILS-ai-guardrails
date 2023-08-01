from globals import Globals
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain import OpenAI
from langchain.llms import VertexAI
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
from executors.utils.LlmProvider import LlmProvider
from executors.utils.ParamsProvider import ParamsProvider


class SummarizeBriefChain:
    params=ParamsProvider.get_params('summarize-brief')
    map_prompt_template = params['map_prompt_template']
    reduce_prompt_template = params['reduce_prompt_template']

    def execute(self,filepath):
        temp = Globals.model_temp
        
        llm=LlmProvider.get_llm(is_private=False, use_chat_model=False, max_output_token=1000, increase_model_token_limit=False)
        
        loader = PyPDFLoader(filepath)
        pages = loader.load_and_split()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        docs = text_splitter.split_documents(pages)

        MAP_PROMPT = PromptTemplate(template=SummarizeBriefChain.map_prompt_template, input_variables=["text"])
        REDUCE_PROMPT = PromptTemplate(template=SummarizeBriefChain.reduce_prompt_template, input_variables=["text"])
        chain = load_summarize_chain(llm, chain_type="map_reduce",  map_prompt=MAP_PROMPT, combine_prompt=REDUCE_PROMPT,verbose=True)
        result = chain({"input_documents": docs}, return_only_outputs=True)
        return result["output_text"]

