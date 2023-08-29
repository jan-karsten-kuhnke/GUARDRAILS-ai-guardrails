import json
import random
from langchain import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.llms import  VertexAI
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from globals import Globals
from executors.utils.LlmProvider import LlmProvider
from database.repository import Persistence
from typing import Any
import logging,time
from executors.utils.AppletResponse import AppletResponse
from utils.util import utils
from datetime import datetime


class Conversation:
    @classmethod
    def get_class_name(cls):
        return cls.__name__
    
    def execute(self, query, is_private, chat_history, params):
        start_time = time.time()
        model_type = params['modelType']
        
        curr_date = datetime.today()
        
        memory = ConversationBufferMemory(memory_key="chat_history",return_messages=True)
        
        for history in chat_history:
            memory.save_context({"input": history[0]}, {"output": history[1]})
        
        llm=LlmProvider.get_llm(class_name= self.get_class_name(),model_type=model_type, is_private=is_private, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)
        
        _DEFAULT_TEMPLATE = f"""You are ChatGPT, a large language model trained by OpenAI, based on the GPT-3.5 architecture , and you like explaining in detail , so answer in detail as possible.\nCurrent date: {curr_date}.

        {{chat_history}}
        Human: {{input}}
        Assistant:"""

        PROMPT = PromptTemplate(
        input_variables=["chat_history","input"], template=_DEFAULT_TEMPLATE
        )
            
        chain = LLMChain(
            llm=llm,verbose=True,memory=memory,
            prompt=PROMPT
        )
       
        # Prepare the chain

        answer = chain.predict(input= query)
        answer = answer.replace("\\n", "\n")
        
        response=AppletResponse(answer, [])
        execution_time = round(time.time() - start_time,2)
        logging.info(utils.logging_info(self.get_class_name(),"Execution Time (s): ", execution_time))
        return response.obj()