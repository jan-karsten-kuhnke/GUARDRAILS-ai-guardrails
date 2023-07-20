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
from langchain.chains import SQLDatabaseSequentialChain
from executors.SqlWrapper import SqlWrapper
from langchain.chains import LLMChain
import sqlalchemy
import json
from sqlalchemy import create_engine,text
from sqlalchemy.orm import sessionmaker

class VisualizationChain:
    private_llm: Any = None
    public_llm: Any = None

    temp = Globals.model_temp
    PROMPT_SUFFIX = """Only use the following tables:
    {table_info}

    Question: {input}"""

    _DEFAULT_TEMPLATE = """Given an input question, first create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer.
    Unless the user specifies in his question a specific number of examples he wishes to obtain, always limit your query to at most {top_k} results.
    You can order the results by a relevant column to return the most interesting examples in the database.
    Pay attention to the following details while creating the query:
    - DO NOT CREATE ANY QUERIES THAT CAN MANIPULATE THE DATABASE, like INSERT, UPDATE, DELETE, ALTER, if the user asks for a query that manipulates the database, return an error message in the answer.
    - Use Aggregations if required to answer questions on the basis of the question.
    - When creating aliases and then using those aliases to create joins, make sure that the aliases are unique.
    - When using aliases to refer to the columns of that table, make sure to use the correct alias names.
    - When 2 tables have the same column name, make sure to build the query in such a way that there is no ambiguity in which column is being referred to.
    - Try to not use subqueries unless absolutely necessary.
    - When querying on the metric_values table, always use metrics table as a reference to get the correct metric_id.
    - If using subquery in the having clause, make sure the subquery returns only one row. 
    - Always terminate your SQL Query with a semi-colon
    - When  building a query , always include the name columns of the entity instead of the entity id in the select clause.
    - If the result dataset is more than 20 rows, return only the top 5 rows, as a markdown table and ignore the rest of the rows, also add the following statement to the response 'Result dataset is too large, showing only the top 5 rows, please use the query in a sql agent to see the full result dataset.'
    Never query for all the columns from a specific table, only ask for a the few relevant columns given the question.


    Pay attention to use only the column names that you can see in the schema description. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.

    Use the following format:

    Question: Question here
    SQLQuery: SQL Query to run
    SQLResult: Result of the SQLQuery
    Answer: Final answer here
    """

    PROMPT = PromptTemplate(
        input_variables=["input", "table_info", "dialect", "top_k"],
        template=_DEFAULT_TEMPLATE + PROMPT_SUFFIX,
    )
    callbacks = [StreamingStdOutCallbackHandler()]
    if Globals.public_model_type == "OpenAI":
        public_llm = OpenAI(
            callbacks=callbacks,
            verbose=False,
            temperature=temp,
            model_name="gpt-3.5-turbo-16k",
            
        )
    elif Globals.public_model_type == "VertexAI":
        public_llm = VertexAI(max_output_tokens=1000, verbose=False)
    private_llm = public_llm

    def execute(self, query, is_private, chat_history):
        # conn_str = f"postgresql+psycopg2://postgres:1234@localhost:5432/AdventureWorks"
        conn_str = Globals.METRIC_DB_URL

        db = SqlWrapper.from_uri(
            database_uri=conn_str,
            # schemas=['humanresources','person','production','purchasing','sales'],
            schemas=[Globals.METRIC_SCHEMA],
        )
        if is_private:
            logging.info(f"using private model: {Globals.private_model_type}")
            chain = SQLDatabaseSequentialChain.from_llm(
                self.private_llm, db, verbose=True, return_intermediate_steps=True,
                query_prompt=self.PROMPT,**{'top_k':1000}
            )
        else:
            logging.info(f"using public model: {Globals.public_model_type}")
            chain = SQLDatabaseSequentialChain.from_llm(
                self.public_llm, db, verbose=True, return_intermediate_steps=True, query_prompt=self.PROMPT,**{'top_k':1000}
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
            VEGA_LITE_PROMPT = """You are a great assistant at vega-lite visualization creation. No matter what the user ask, you should always response with a valid vega-lite specification in JSON.

            You have been given a user question and  a sql query that answers that question, you also have been given a sample result of the sql query.

            You should create the vega-lite specification based on user's query.

            Besides, Here are some requirements:
            1. Do not contain the key called 'data' in vega-lite specification.
            2. If the user ask many times, you should generate the specification based on the previous context.
            3. You should consider to aggregate the field if it is quantitative and the chart has a mark type of react, bar, line, area or arc.
            5. Do not contain any text in the response apart from the vega-lite specification in JSON.

            User Question: {question}
            SQL Query: {sql_query}
            SQL Result: {sql_data}
"""

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
