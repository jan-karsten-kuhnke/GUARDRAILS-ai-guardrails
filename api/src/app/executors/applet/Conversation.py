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
from typing import Any
import logging
from executors.utils.AppletResponse import AppletResponse


class Conversation:
    
    def execute(self, query, is_private, chat_history):
        memory = ConversationBufferMemory(memory_key="chat_history",return_messages=True)
        for history in chat_history:
            memory.save_context({"input": history[0]}, {"output": history[1]})
        
        llm=LlmProvider.get_llm(is_private=is_private, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)
        
        _DEFAULT_TEMPLATE = """You are ChatGPT, a large language model trained by OpenAI, based on the GPT-3.5 architecture , and you like explaining in detail , so answer in detail as possible.\nCurrent date: 2023-03-02.

        {chat_history}
        Human: {input}
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

        return response.obj()