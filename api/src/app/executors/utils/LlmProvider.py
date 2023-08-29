from globals import Globals
from langchain.chat_models import ChatOpenAI, ChatVertexAI
from langchain.llms import  VertexAI
from langchain import OpenAI
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
# from executors.utils.helper import MyCustomHandler
from typing import Any
# from executors.utils.LlmCallbackHandler import LlmCallbackHandler
from executors.utils.LlmCallbackHandler import LlmCallbackHandler

class LlmProvider:
    def get_llm(class_name = None,model_type="OpenAI", is_private=False, use_chat_model= False, max_output_token = 1000 , increase_model_token_limit=False):
        private_llm: Any = None
        public_llm: Any = None
        callbacks = [StreamingStdOutCallbackHandler(),LlmCallbackHandler(class_name=class_name)]
        temp = Globals.model_temp
        
            
        if model_type == "OpenAI":
            if use_chat_model:
                if increase_model_token_limit:
                    public_llm = ChatOpenAI(callbacks=callbacks, verbose=False, temperature=temp,max_tokens=max_output_token, model= "gpt-3.5-turbo-16k")
                else:
                    public_llm = ChatOpenAI(callbacks=callbacks, verbose=False, temperature=temp,max_tokens=max_output_token)   
            else:
                if increase_model_token_limit:
                    public_llm = OpenAI(callbacks=callbacks, verbose=False, temperature=temp,model= "gpt-3.5-turbo-16k")
                else:
                    public_llm = OpenAI(callbacks=callbacks, verbose=False, temperature=temp,max_tokens=max_output_token)
        elif model_type == "VertexAI":
            if use_chat_model:
                public_llm=ChatVertexAI(max_output_tokens=max_output_token, verbose=False)
            else:    
                public_llm = VertexAI(max_output_tokens=max_output_token, verbose=False)
        
        return public_llm