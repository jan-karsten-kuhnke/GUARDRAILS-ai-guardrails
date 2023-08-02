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
import json
from sqlalchemy import create_engine,text
from sqlalchemy.orm import sessionmaker
from langchain.output_parsers.list import CommaSeparatedListOutputParser
from database.repository import Persistence

class VisualizationChain:

    def execute(self, query, is_private, chat_history):
        chain=Persistence.get_chain_by_code('qa-viz')
        params=chain['params']
        
        PROMPT_SUFFIX =params['promptSuffix']

        _DEFAULT_TEMPLATE = params['defaultTemplate']
        
        _DECIDER_TEMPLATE = params['deciderTemplate']
        
        DECIDER_PROMPT = PromptTemplate(
            input_variables=["query", "table_names"],
            template=_DECIDER_TEMPLATE,
            output_parser=CommaSeparatedListOutputParser(),
        )

        PROMPT = PromptTemplate(
            input_variables=["input", "table_info", "dialect", "top_k"],
            template=_DEFAULT_TEMPLATE + PROMPT_SUFFIX,
        )
        
        # conn_str = f"postgresql+psycopg2://postgres:1234@localhost:5432/AdventureWorks"
        conn_str = Globals.METRIC_DB_URL

        db = SqlWrapper.from_uri(
            database_uri=conn_str,
            # schemas=['humanresources','person','production','purchasing','sales'],
            schemas=[Globals.METRIC_SCHEMA],
        )
        
        llm=LlmProvider.get_llm(is_private=is_private,use_chat_model=False,max_output_token=1000,increase_model_token_limit=True)
        
        chain = SQLDatabaseSequentialChain.from_llm(
            llm, db, verbose=True, return_intermediate_steps=True,
            query_prompt=self.PROMPT,**{'top_k':10000000000},decider_prompt=self.DECIDER_PROMPT
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
            sql_data = sql_results[1].split("\nAnswer:")[0]
            VEGA_LITE_PROMPT = params['vegaLitePrompt']

            vega_prompt = PromptTemplate(
                input_variables=["question", "sql_query", "sql_data"],
                template=VEGA_LITE_PROMPT,
            )
                        
            vega_chain = LLMChain(llm=self.public_llm, prompt=vega_prompt)
            config = vega_chain.run({'sql_data':sql_data, 'sql_query':sql_query, 'question':query})

            modified_sql_query = sql_query.replace("\n", " ")

            engine = create_engine(conn_str)
            
            Session = sessionmaker(bind=engine)
            session = Session()


            sql_result = session.execute(text(modified_sql_query))
            rows = sql_result.fetchall()
            column_names = sql_result.keys()
            json_data = json.dumps([dict(zip(column_names, row)) for row in rows],indent=4, sort_keys=True, default=str)

            session.close()
            engine.dispose()

            return {"answer": "", "sources": sources, "visualization": config, "dataset": json_data}


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

        return {"answer": answer, "sources": sources}
