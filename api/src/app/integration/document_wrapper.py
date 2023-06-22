import json
import requests
from globals import Globals

url = Globals.open_ai_api_key
class document_wrapper:
    
    def document_completion(messages,token):
        url = Globals.document_api_url
        payload = json.dumps({
            "query": messages[-1]['content'],
            "model_type": "OpenAI"
        })
        
        headers = {
            'Authorization': f"Bearer {token}",
            'Content-Type': 'application/json'
        }
        res = requests.request("POST", url, headers=headers, data=payload).json()
        return res
    

