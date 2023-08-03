from globals import Globals

from langchain.document_loaders import PyPDFLoader
from langchain.chat_models import ChatOpenAI, ChatVertexAI
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.summarize import load_summarize_chain
from executors.utils.LlmProvider import LlmProvider
from database.repository import Persistence
from langchain.chat_models import ChatOpenAI
from langchain.chains import create_extraction_chain
import json


class Extraction:
    def execute(self, filepath):
        loader = PyPDFLoader(filepath)
        pages = loader.load()
        chain = Persistence.get_chain_by_code('extraction')
        params = chain['params']

        input_text = ''
        for page in pages:
            input_text += page.page_content

        schema = {
            "properties": {
                "project_site_area": {"type": "string"},
                "project_maximum_building_height": {"type": "string"},
                "project_gross_plot_ratio": {"type": "string"},
                "flat_data_type": {"type": "string"},
                "flat_data_flat_type": {"type": "string"},
                "flat_data_ifa": {"type": "string"},
                "flat_data_flat_percentage": {"type": "string"}
            },
            "required": []
        }

        llm = LlmProvider.get_llm(is_private=False, use_chat_model=True, max_output_token=1000, increase_model_token_limit=True)

        chain = create_extraction_chain(schema=schema, llm=llm)

        result = chain.run(input_text)
        

        # answer = "Here are the extracted fields: " "```\n" + json.dumps(result[0]) + "\n```"
        answer = """Sure! Here's the extracted JSON:

```
""" + json.dumps(result, indent=4, sort_keys=True )+ """
```
"""
      
        return answer
