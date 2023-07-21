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
from langchain.output_parsers.list import CommaSeparatedListOutputParser


class SqlChain:
    private_llm: Any = None
    public_llm: Any = None

    temp = Globals.model_temp
    PROMPT_SUFFIX = """Only use the following tables:
    {table_info}

    Question: {input}"""

    _DEFAULT_TEMPLATE = """Given an input question, the SQL Agent should create a syntactically correct {dialect} query to run and return the answer based on the query results.

Here are the guidelines for building the query:

1. Always limit the query to at most {top_k} results, unless the user specifies a specific number of examples they wish to obtain.
2. Order the results by a relevant column to return the most interesting examples in the database.
3. Do NOT create any queries that can manipulate the database, such as INSERT, UPDATE, DELETE, ALTER. If the user asks for a query that manipulates the database, return an error message in the answer.
4. Use the correct join type and join condition when using joins. Make sure to refer to the correct column names.
5. Handle situations where two tables have the same column name to avoid ambiguity in the query.
6. Utilize subqueries to break down the problem into smaller steps when necessary.
7. For string comparisons, perform a lookup in the table to find the best match for the string, and then use the ID of the best match in the query.
8. Always terminate the SQL Query with a semi-colon.
9. In the resultset, include the name columns of the entity instead of the entity ID in the select clause.
10. If the result dataset is more than 20 rows, return only the top 5 rows as a markdown table and ignore the rest of the rows. Add the following statement to the response: 'Result dataset is too large, showing only a part of the resultset, please use the query in a SQL agent to see the full result dataset.'
11. Never query for all the columns from a specific table; only ask for a few relevant columns given the question.
12. Pay attention to using only the column names visible in the schema description. Avoid querying for columns that do not exist. Also, be mindful of which column is in which table.

Use the following format for the query:


    Question: Question here
    SQLQuery: SQL Query to run
    SQLResult: Result of the SQLQuery
    Answer: Final answer here
    """


    _DECIDER_TEMPLATE = """Given the below input question and list of  tables that could be used to get the results, consider the following instructions which will be used to generate a query, based on the input, list of tables and the instructions,  output a comma separated list of the table names that may be necessary to answer this question.

    Instructions:
    2. Order the results by a relevant column to return the most interesting examples in the database.
    3. Do NOT create any queries that can manipulate the database, such as INSERT, UPDATE, DELETE, ALTER. If the user asks for a query that manipulates the database, return an error message in the answer.
    4. Use the correct join type and join condition when using joins. Make sure to refer to the correct column names.
    5. Handle situations where two tables have the same column name to avoid ambiguity in the query.
    6. Utilize subqueries to break down the problem into smaller steps when necessary.
    7. For string comparisons, perform a lookup in the table to find the best match for the string, and then use the ID of the best match in the query.
    8. Always terminate the SQL Query with a semi-colon.
    9. In the resultset, include the name columns of the entity instead of the entity ID in the select clause.
    10. If the result dataset is more than 20 rows, return only the top 5 rows as a markdown table and ignore the rest of the rows. Add the following statement to the response: 'Result dataset is too large, showing only a part of the resultset, please use the query in a SQL agent to see the full result dataset.'
    11. Never query for all the columns from a specific table; only ask for a few relevant columns given the question.
    12. Pay attention to using only the column names visible in the schema description. Avoid querying for columns that do not exist. Also, be mindful of which column is in which table.

    Question: {query}

    Table Names: {table_names}

    Relevant Table Names:"""
    DECIDER_PROMPT = PromptTemplate(
        input_variables=["query", "table_names"],
        template=_DECIDER_TEMPLATE,
        output_parser=CommaSeparatedListOutputParser(),
    )

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
                self.private_llm, db, verbose=True, return_intermediate_steps=True,decider_prompt=SqlChain.DECIDER_PROMPT,
                query_prompt=SqlChain.PROMPT ,**{'top_k':10}
            )
        else:
            logging.info(f"using public model: {Globals.public_model_type}")
            chain = SQLDatabaseSequentialChain.from_llm(
                self.public_llm, db, verbose=True, return_intermediate_steps=True, query_prompt=self.PROMPT,**{'top_k':10},decider_prompt=SqlChain.DECIDER_PROMPT
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
