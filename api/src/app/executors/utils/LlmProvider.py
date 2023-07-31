from globals import Globals
from langchain.chat_models import ChatOpenAI, ChatVertexAI
from langchain.llms import  VertexAI
from langchain import OpenAI
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler


class LlmProvider:
    def get_llm(is_private=False, use_chat_model= False, max_output_token = 1000 , increase_model_token_limit=False):
        private_llm: Any = None
        public_llm: Any = None

        callbacks = [StreamingStdOutCallbackHandler()]
        temp = Globals.model_temp
        
            
        if Globals.public_model_type == "OpenAI":
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
        elif Globals.public_model_type == "VertexAI":
            if use_chat_model:
                public_llm=ChatVertexAI(max_output_tokens=max_output_token, verbose=False)
            else:    
                public_llm = VertexAI(max_output_tokens=max_output_token, verbose=False)
        
        return public_llm