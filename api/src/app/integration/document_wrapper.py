import json
import logging
import requests
from globals import Globals

url = Globals.open_ai_api_key
class document_wrapper:
    
    def document_completion(messages,token,is_private,prompt):
        res = {}
        try:
            history = []
            if len(messages) > 1:
                for i in range(len(messages)-1):
                    print(i)
                    if(messages[i]['role'] == 'user'):
                        history.append(
                            {
                                "input": messages[i]['content'],
                                "output": messages[i+1]['content'],
                            }
                        )
            url = Globals.document_api_url
            payload = json.dumps({
                "query": prompt,
                "is_private": is_private,
                "history": history,
            })
            
            headers = {
                "Authorization" : f"Bearer {token}",
                "Content-Type": "application/json"
            }
            res = requests.request("POST", url + "/qa", headers=headers, data=payload).json()
            logging.info("received response From document_completion")
        except Exception as e:
            logging.error("error: "+str(e))
        return res
    

