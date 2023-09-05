import json,time
from langchain import  PromptTemplate
from typing import Any
import logging
from executors.utils.LlmProvider import LlmProvider
from database.repository import Persistence
from executors.utils.AppletResponse import AppletResponse
from langchain.agents import create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
# from langchain.agents import AgentExecutor
from langchain.agents.agent_types import AgentType
from langchain.output_parsers.list import CommaSeparatedListOutputParser
from utils.util import log
from executors.wrappers.SqlWrapper import SqlWrapper
from utils.encryption import Encryption


class SqlAgent:

    def execute(self, query, is_private, chat_history, params):
        start_time = time.time()
        model_type = params['modelType']
       
        data_source_id = params['dataSourceId']
        data_source = Persistence.get_data_source_by_id(data_source_id)

        db_url = Encryption.decrypt(data_source['connection_string'])

        db_schemas = data_source['schemas'] if data_source['schemas'] else []
        tables = data_source['tables_to_include'] if data_source['tables_to_include'] else []



        db = SqlWrapper.from_uri(
            database_uri = db_url,
            schemas = db_schemas,
            include_tables = tables
        )
        
        llm=LlmProvider.get_llm(class_name= __class__.__name__,model_type=model_type, is_private=is_private, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)
        
        agent_executor = create_sql_agent(
            llm=llm,
            toolkit=SQLDatabaseToolkit(db=db, llm=llm),
            verbose=True,
            agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        )



        sources = []
        # Prepare the chain
        try:
            result = agent_executor.run(query)
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

        response=AppletResponse(result, sources)
        execution_time = round(time.time() - start_time,2)
        logging.info(log(__class__.__name__,"Execution Time (s): ", execution_time))
        return response.obj()
