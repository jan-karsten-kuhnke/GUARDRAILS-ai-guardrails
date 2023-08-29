import json,time
import random
from langchain import OpenAI, PromptTemplate
from langchain.chains import ConversationChain
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.llms import VertexAI
from langchain.memory import ConversationBufferMemory
from globals import Globals
from typing import Any
import logging
from executors.utils.LlmProvider import LlmProvider
from database.repository import Persistence
from executors.utils.AppletResponse import AppletResponse
from executors.wrappers.SQLSequentialChainWrapper import SQLDatabaseSequentialChain
from executors.wrappers.SqlWrapper import SqlWrapper
from langchain.output_parsers.list import CommaSeparatedListOutputParser
from cryptography.fernet import Fernet
from utils.util import utils

class Sql:
    @classmethod
    def get_class_name(cls):
        return cls.__name__

    def execute(self, query, is_private, chat_history, params):
        start_time = time.time()
        model_type = params['modelType']
        
        PROMPT_SUFFIX =params['promptSuffix']

        _DEFAULT_TEMPLATE = params['defaultTemplate']
        
        _DECIDER_TEMPLATE = params['deciderTemplate']

        DECIDER_PROMPT_INPUT_VARIABLES = params['deciderPromptInputVariables']

        PROMPT_INPUT_VARIABLES = params['promptInputVariables']

        DECIDER_PROMPT = PromptTemplate(
            input_variables=DECIDER_PROMPT_INPUT_VARIABLES,
            template=_DECIDER_TEMPLATE,
            output_parser=CommaSeparatedListOutputParser(),
        )

        PROMPT = PromptTemplate(
            input_variables=PROMPT_INPUT_VARIABLES,
            template=_DEFAULT_TEMPLATE + PROMPT_SUFFIX,
        )
        
        key_str = Globals.ENCRYPTION_KEY
        key = key_str.encode('utf-8')
        
        data_source_id = params['dataSourceId']
        data_source = Persistence.get_data_source_by_id(data_source_id)

        fernet = Fernet(key)
        encoded_db_url = data_source['connection_string'].encode('utf-8')
        db_url = fernet.decrypt(encoded_db_url).decode()

        db_schemas = data_source['schemas'] if data_source['schemas'] else []
        tables = data_source['tables_to_include'] if data_source['tables_to_include'] else []



        db = SqlWrapper.from_uri(
            database_uri = db_url,
            schemas = db_schemas,
            include_tables = tables
        )
        
        llm=LlmProvider.get_llm(class_name=self.get_class_name(),model_type=model_type, is_private=is_private, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)
        
        chain = SQLDatabaseSequentialChain.from_llm(
            llm, db, verbose=True, return_intermediate_steps=True,decider_prompt=DECIDER_PROMPT,
            query_prompt=PROMPT ,**{'top_k':10}
        )
        

        sources = []
        # Prepare the chain
        try:
            result = chain(query)
            answer = result["result"]
            sql_results = (
                result["intermediate_steps"][0]["input"]
                .split("\nSQLQuery:")[1]
                .split("\nSQLResult:")
            )
            sql_query = sql_results[0]
            sql_query = "```\n" + sql_query.replace("\n", "\n\n") + "\n```"
            sql_data = sql_results[1].split("\nAnswer:")[0]

            

            sql_query_source = {
                "type": "source",
                "doc": sql_query,
                "metadata": {"source": "Generated SQL Query"},
            }
            sql_result_source = {
                "type": "source",
                "doc": sql_data,
                "metadata": {"source": "Data From DB"},
            }
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
