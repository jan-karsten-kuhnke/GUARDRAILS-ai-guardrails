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
import logging
from executors.utils.AppletResponse import AppletResponse


class Conversation:
    
    def execute(self, query, is_private, chat_history):
        chain = Persistence.get_chain_by_code('conversation')
        params = chain['params']
        model_type = params['modelType']

        memory = ConversationBufferMemory(return_messages=True)
        for history in chat_history:
            memory.save_context({"input": history[0]}, {"output": history[1]})
        
        llm=LlmProvider.get_llm(model_type=model_type, is_private=is_private, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)
        
        chain = ConversationChain(
            llm=llm,verbose=True,memory=memory,
        )
       
        # Prepare the chain

        answer = chain.predict(input= query)
        answer = answer.replace("\\n", "\n")
        
        response=AppletResponse(answer, [])

        return response.obj()