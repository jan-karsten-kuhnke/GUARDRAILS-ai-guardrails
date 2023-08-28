import json
import random
import time,datetime
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
from langchain.callbacks import get_openai_callback
from executors.utils.helper import measure_time,log_result
class Conversation:
    
    @classmethod
    def get_class_name(cls):
        return cls.__name__
    
    def execute(self, query, is_private, chat_history, params):
        log_details = {}
        response = None
        try:
            model_type = params['modelType']
            memory = ConversationBufferMemory(return_messages=True)
            for history in chat_history:
                memory.save_context({"input": history[0]}, {"output": history[1]})
            
            llm=LlmProvider.get_llm(model_type=model_type, is_private=is_private, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)
            
            chain = ConversationChain(
                llm=llm,verbose=True,memory=memory,
            )
            if( model_type == "OpenAI"):
                with get_openai_callback() as cb:
                    start_time = time.time()
                    time_stamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    answer = chain.predict(input=query)
                    answer = answer.replace("\\n", "\n")
                    execution_time = measure_time(start_time)
                    class_name = self.get_class_name()
                    response=AppletResponse(answer, [])
            elif(model_type == "VertexAI"):
                answer = chain.predict(input=query)
                answer = answer.replace("\\n", "\n")
                response=AppletResponse(answer, [])
            
            log_details = {
                    "Execution Time": round(execution_time, 2) ,
                    "Token Count": cb.total_tokens if model_type == "OpenAI" else None,
                    "Timestamp": time_stamp,
                    "Class Name": class_name,
                    "Prompt": "This is a dummy prompt",
                    "Steps": None
                }
        
        except Exception as e:
            error_message = str(e)
            class_name = self.get_class_name()
            log_details = {
                "Error", error_message,
                "Class Name", class_name,
                "Timestamp", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            response=AppletResponse('Sorry, I Could not satify your query.', [])

        finally:
            stream = log_result(log_details)
            print(stream)
            if response is not None:
                return response.obj()
