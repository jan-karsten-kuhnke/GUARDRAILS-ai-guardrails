import json
import logging
import requests
from globals import Globals

url = Globals.open_ai_api_key
class document_wrapper:
    
    def document_completion(messages,token,is_private,prompt,task):
        res = {}
        try:
            history = []
            if len(messages) > 1:
                for i in range(len(messages)-1):
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
                "task": task
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
    
    def summarize_brief(files,token):
        res = {}
        try:
            url = Globals.document_api_url
            payload = {}
            headers = {
                "Authorization" : f"Bearer {token}",
                "Content-Type": "multipart/form-data"
            }
            file=files[0]
            files_to_send=[ ('files',(file.filename,file.stream,'application/pdf'))]
            print("hello")
            res = requests.request("POST", url + "/summarizebrief", files=files_to_send, headers=headers)
            print(res)

            logging.info("received response From summarize_brief")
        except Exception as e:
            logging.error("error: "+str(e))
            
        return {
            "answer": "summary",
        }
            
