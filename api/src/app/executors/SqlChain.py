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


class SqlChain:
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
    - When creating aliases and then using those aliases to create joins, make sure that the aliases are unique.
    - When using aliases to refer to the columns of that table, make sure to use the correct alias names.
    - When 2 tables have the same column name, make sure to build the query in such a way that there is no ambiguity in which column is being referred to.\
    - Try to not use subqueries unless absolutely necessary.
    - If using subquery in the having clause, make sure the subquery returns only one row. 

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
        conn_str = Globals.DB_URL

        db = SqlWrapper.from_uri(
            database_uri=conn_str,
            # schemas=['humanresources','person','production','purchasing','sales'],
            schemas=Globals.pg_schema,
        )
        if is_private:
            logging.info(f"using private model: {Globals.private_model_type}")
            chain = SQLDatabaseSequentialChain.from_llm(
                self.private_llm, db, verbose=True, return_intermediate_steps=True,
                query_prompt=self.PROMPT,top_k=10
            )
        else:
            logging.info(f"using public model: {Globals.public_model_type}")
            chain = SQLDatabaseSequentialChain.from_llm(
                self.public_llm, db, verbose=True, return_intermediate_steps=True, query_prompt=self.PROMPT,
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

        return {"answer": answer, "sources": sources}
