import logging
from langchain.callbacks.base import BaseCallbackHandler
from utils.util import log

class LlmCallbackHandler(BaseCallbackHandler):
    """A callback handler that uses BaseCallbackHandler methods to performs actions on various stage."""

    def __init__(self, class_name):
        self.class_name = class_name
        self.timestamp = None
        self.execution_time = None

    def on_llm_start(self, serialized, prompts, **kwargs):
        logging.info(log(self.class_name,"Prompt TO LLM: ", prompts))

    def on_llm_end(self, response, **kwargs):
        token_usage = response.llm_output['token_usage'] if 'token_usage' in response.llm_output else {}
        logging.debug(log(self.class_name, "Input Token Count: ", token_usage.get('prompt_tokens', 0)))
        logging.debug(log(self.class_name, "Output Token Count: ", token_usage.get('completion_tokens', 0)))
        logging.debug(log(self.class_name, "Total Token Count: ", token_usage.get('total_tokens', 0)))

    def on_llm_error(self, error, **kwargs):
        logging.debug(log(self.class_name,"LLM Error: ", error))

    def on_chain_error(self,error, **kwargs):
        logging.debug(log(self.class_name,"Chain Error: ", error))
        
           