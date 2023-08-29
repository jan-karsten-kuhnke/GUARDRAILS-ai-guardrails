import json
import random
from langchain import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.llms import  VertexAI
from langchain.memory import ConversationBufferMemory
from globals import Globals
from executors.utils.LlmProvider import LlmProvider
from database.repository import Persistence
from typing import Any
import logging,time
from executors.utils.AppletResponse import AppletResponse
from utils.util import utils

class Conversation:
    @classmethod
    def get_class_name(cls):
        return cls.__name__
    
    def execute(self, query, is_private, chat_history, params):
        start_time = time.time()
        model_type = params['modelType']

        memory = ConversationBufferMemory(return_messages=True)
        for history in chat_history:
            memory.save_context({"input": history[0]}, {"output": history[1]})
        
        llm=LlmProvider.get_llm(class_name= self.get_class_name(),model_type=model_type, is_private=is_private, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)
        
        chain = ConversationChain(
            llm=llm,verbose=True,memory=memory,
        )
       
        # Prepare the chain

        answer = chain.predict(input= query)
        answer = answer.replace("\\n", "\n")
        
        response=AppletResponse(answer, [])
        execution_time = round(time.time() - start_time,2)
        logging.info(utils.logging_info(self.get_class_name(),"Execution Time (s): ", execution_time))
        return response.obj()