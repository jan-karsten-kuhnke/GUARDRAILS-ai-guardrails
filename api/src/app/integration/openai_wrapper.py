import openai
from globals import Globals

api_key = Globals.open_ai_api_key
class openai_wrapper:
    
    def chat_completion(messages, model):
        openai.api_key = api_key
        response = openai.ChatCompletion.create(
            model = model,
            messages=messages,
            temperature=0.1,
            stream=True,  # this time, we set stream=True
        )
        return response
    

    def gen_title(prompt, model):
        if model == 'gpt-3.5-turbo':
            openai.api_key = api_key
            response = openai.ChatCompletion.create(
                model=model,
                messages=[{"role": "user", "content":  'Generate conversation title for this message "' + prompt + '"  Respond only with the title.'}],
                temperature=0,
                stream=False,  # this time, we set stream=True
            )
            title  = response['choices'][0]['message']['content']
            return str(title[1:-1])
        else:
            return prompt

