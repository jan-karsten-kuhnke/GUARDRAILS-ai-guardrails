import json
import random
from langchain import OpenAI, PromptTemplate
from langchain.chains import ConversationChain
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.llms import VertexAI
from langchain.memory import ConversationBufferMemory
from globals import Globals
from typing import Any
import logging
from executors.wrappers.SQLSequentialChainWrapper import SQLDatabaseSequentialChain
from executors.wrappers.SqlWrapper import SqlWrapper
from executors.utils.LlmProvider import LlmProvider
from langchain.chains import LLMChain
import sqlalchemy
from sqlalchemy import create_engine,text
from sqlalchemy.orm import sessionmaker
from langchain.output_parsers.list import CommaSeparatedListOutputParser
from database.repository import Persistence
from executors.applet.Sql import Sql
from executors.utils.AppletResponse import AppletResponse
from cryptography.fernet import Fernet
import logging,time
from utils.util import utils

class Visualization:
    @classmethod
    def get_class_name(cls):
        return cls.__name__

    def execute(self, query, is_private, chat_history, params):
        try:
            start_time = time.time()
            model_type = params['modelType']
            
            
            sources = []
            
            key_str =Globals.ENCRYPTION_KEY
            key = key_str.encode('utf-8')

            data_source_id = params['dataSourceId']
            data_source = Persistence.get_data_source_by_id(data_source_id)

            fernet = Fernet(key)
        
            encoded_db_url = data_source['connection_string'].encode('utf-8')
            db_url = fernet.decrypt(encoded_db_url).decode()
            
            llm=LlmProvider.get_llm(class_name= self.get_class_name(),model_type=model_type, is_private=is_private,use_chat_model=True,max_output_token=1000,increase_model_token_limit=True)
            
            sql_applet_code=params['sqlAppletCode']
            
            sql_chain = Persistence.get_chain_by_code(sql_applet_code)
            sql_params = sql_chain['params']
            executor_instance = Sql()
            sql_result = executor_instance.execute(query=query, is_private=is_private, chat_history=chat_history, params=sql_params)
            sql_query_source = json.loads(sql_result['sources'][0])
            sql_data_source = json.loads(sql_result['sources'][1])
            
            sql_query=sql_query_source['doc']
            sql_query = sql_query[3:-3]
            sql_data=sql_data_source['doc']
  
            
            VEGA_LITE_PROMPT = params['vegaLitePrompt']

            VEGA_PROMPT_INPUT_VARIABLES = params['vegaPromptInputVariables']

            vega_prompt = PromptTemplate(
                input_variables=VEGA_PROMPT_INPUT_VARIABLES,
                template=VEGA_LITE_PROMPT,
            )
                        
            vega_chain = LLMChain(llm=llm, prompt=vega_prompt)
            config = vega_chain.run({'sql_data':sql_data, 'sql_query':sql_query, 'question':query})

            config = config.replace("```JSON\n", "").replace("```", "")

            modified_sql_query = sql_query.replace("\n", " ")

            engine = create_engine (db_url)
            
            Session = sessionmaker(bind=engine)
            session = Session()


            sql_result = session.execute(text(modified_sql_query))
            rows = sql_result.fetchall()
            column_names = sql_result.keys()
            json_data = json.dumps([dict(zip(column_names, row)) for row in rows],indent=4, sort_keys=True, default=str)

            session.close()
            engine.dispose()

            response=AppletResponse("", sources, config, json_data)
            return response.obj()


        except Exception as e:
            logging.error(e)
            answer = "Sorry, I don't know the answer to that."
            sql_query_source = {
                "type": "source",
                "doc": "Sorry, I don't know the answer to that.",
                "metadata": {"source": "Generated SQL Query"},
            }
            sql_result_source = {
                "type": "source",
                "doc": "Sorry, I don't know the answer to that.",
                "metadata": {"source": "Data From DB"},
            }

        sources.append(json.dumps(sql_query_source))
        sources.append(json.dumps(sql_result_source))

        response=AppletResponse(answer, sources)
        execution_time = round(time.time() - start_time,2)
        logging.info(utils.logging_info(self.get_class_name(),"Execution Time (s): ", execution_time))

        return response.obj()
