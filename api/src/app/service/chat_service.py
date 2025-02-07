import os
import logging
from repo.db import conversation_context
from database.repository import Persistence
from integration.openai_wrapper import openai_wrapper
from service.document_service import DocumentService
import uuid
from typing import TypedDict, Optional
from datetime import datetime
import json
from executors.applet.Summarize import Summarize
from executors.applet.Extraction import Extraction
from executors.applet.Conversation import Conversation
from executors.applet.QaRetrieval import QaRetrieval
from executors.applet.Sql import Sql
from executors.applet.Visualization import Visualization

from oidc import get_current_user_id
from oidc import get_current_user_groups
from oidc import get_current_user_roles


class conversation_obj(TypedDict):
    _id: str
    title: str
    root_message: str
    last_node: str
    messages: list
    created: datetime
    updated: datetime
    user_id: str
    state: str
    task: str
    metadata: dict
    task_params: dict
    acl:dict


class message_obj(TypedDict):
    id: str
    role: str
    content: str
    created: datetime
    children: list
    msg_info: Optional[dict]
    task: str

class acl_obj(TypedDict):
    uid: list
    gid: list
    rid: list
    owner:str

class chat_service:

    def chat_completion(data, current_user_id, token, user_groups, user_roles, filename=None, filepath=None):
        try:
            task = str(data["task"]) if "task" in data else None
            task_params = data["task_params"] if "task_params" in data else None
            document = task_params["document"] if "document" in task_params else None
            collection_name = task_params["collectionName"] if "collectionName" in task_params else None
            metadata = data["metadata"] if "metadata" in data else None
            
            uploaded_by = current_user_id
            uploaded_at = str(datetime.now())
            
            #getting chain from db
            chain = Persistence.get_chain_by_code(task)
            params = chain['params']
            
            executor = params['executor'] if "executor" in params else None
            
            if task is None or executor is None:
                yield (json.dumps({"error": "Invalid task"}))
                return
            
            #Summarize/Extraction on already uploaded document
            is_document_uploaded=False
            document_array=[]

            if document and executor in ["summarize","extraction"]:
                document_obj=Persistence.get_pgvector_document_by_id(document['id'])
                is_document_uploaded=True
                filename=document_obj['metadata']['title']
                document_array=document_obj['docs']

            conversation_id = None
            manage_conversation_context = False
            
            if executor == "summarize" or executor == "extraction":
                prompt = f"{params['prompt']} {filename}"
                title = f"{params['title']} {filename}."
            else:
                prompt = str(data["message"]) if "message" in data else "Task."
                title = None

            if ('conversation_id' in data and data['conversation_id']):
                conversation_id = data['conversation_id']
                manage_conversation_context = True

            
            
            chat_service.update_conversation(
                conversation_id, prompt, 'user', current_user_id, task,user_groups, user_roles, title, task_params, metadata)

            current_completion = ''
            msg_info = None
            res = None

            messages = []
            role = "assistant"
            if (manage_conversation_context):
                messages = chat_service.get_history_for_bot(
                    conversation_id, current_user_id, user_groups, user_roles)

            is_private = False
            history = []
            if len(messages) > 1:
                for i in range(len(messages)-1):
                    if (messages[i]['role'] == 'user'):
                        history.append(
                            (messages[i]['content'], messages[i+1]['content']))

            if (executor == "summarize"):
                try:
                    logging.info("calling summarize brief executor")
                    if(not is_document_uploaded):
                        DocumentService.create_document(filename,filepath,task_params,uploaded_by,uploaded_at)
                    executor_instance = Summarize()
                    res = executor_instance.execute(filepath=filepath,document_array=document_array,is_document_uploaded=is_document_uploaded, params=params)

                except Exception as e:
                    yield ("Sorry. Some error occured. Please try again.")
                    logging.error("error: "+str(e))

            elif (executor == "extraction"):
                try:
                    if(not is_document_uploaded):
                        DocumentService.create_document(filename,filepath,task_params,uploaded_by,uploaded_at)
                    executor_instance = Extraction()
                    params['collection_name'] = collection_name
                    params['title'] = filename
                    res= executor_instance.execute(filepath=filepath,document_array=document_array,is_document_uploaded=is_document_uploaded, params=params)

                except Exception as e:
                    yield ("Sorry. Some error occured. Please try again.")
                    logging.error("error: "+str(e))
            elif (executor == "conversation"):
                try:
                    logging.info("calling conversation executor")
                    executor_instance = Conversation()
                    res = executor_instance.execute(query=prompt, is_private=is_private, chat_history=history, params=params)

                except Exception as e:
                    yield ("Sorry. Some error occured. Please try again.")
                    logging.error("error: "+str(e))
            elif (executor == "qaRetrieval"):
                try:
                    is_document_selected=False
                    if document:
                        document_obj=Persistence.get_document_by_id(document['id'])
                        title=document_obj['title']
                        is_document_selected=True
                        params['title']=title
                        
                    params['collection_name']=collection_name
                    params['is_document_selected']=is_document_selected
                    logging.info("calling qa retrieval executor")
                    executor_instance = QaRetrieval()
                    res = executor_instance.execute(query=prompt, is_private=is_private, chat_history=history, params=params)

                except Exception as e:
                    yield ("Sorry. Some error occured. Please try again.")
                    logging.error("error: "+str(e))
            elif (executor == "sql"):
                try:
                    logging.info("calling qa sql executor")
                    executor_instance = Sql()
                    res = executor_instance.execute(query=prompt, is_private=is_private, chat_history=history, params=params)

                except Exception as e:
                    yield ("Sorry. Some error occured. Please try again.")
                    logging.error("error: "+str(e))
            elif (executor == "visualization"):
                try:
                    logging.info("calling qa sql executor")
                    executor_instance = Visualization()
                    res = executor_instance.execute(query=prompt, is_private=is_private, chat_history=history, params=params)

                except Exception as e:
                    yield ("Sorry. Some error occured. Please try again.")
                    logging.error("error: "+str(e))
            elif (executor == "tcot-p4d"):
                try:
                    from executors.applet.tcot import Tcot
                    logging.info("calling tcot executor")
                    is_generator = True
                    executor_instance = Tcot()
                    res = executor_instance.execute(query=prompt, is_private=is_private, chat_history=history, params=params)


                except Exception as e:
                    yield ("Sorry. Some error occured. Please try again.")
                    logging.error("error: "+str(e))

            else:
                yield (json.dumps({"error": "Invalid executor"}))

            if is_generator:
                message_id=str(uuid.uuid4())
                for r in res:
                    answer = r['answer']
                    #This id for new response object
                    msg_info = {
                        "sources": r['sources'] if 'sources' in r else [],
                        "visualization": r['visualization'] if 'visualization' in r else None,
                        "dataset": r['dataset'] if 'dataset' in r else None,
                    }
                    chunk = json.dumps({
                        "id": message_id,
                        "role": "assistant",
                        "content": answer,
                        "msg_info": msg_info,
                    })
                    yield (chunk)
                    current_completion += answer
                return
            else:
                answer = res['answer']
                #This id for new response object
                message_id=str(uuid.uuid4())
                msg_info = {
                    "sources": res['sources'] if 'sources' in res else [],
                    "visualization": res['visualization'] if 'visualization' in res else None,
                    "dataset": res['dataset'] if 'dataset' in res else None,
                }
                chunk = json.dumps({
                    "id": message_id,
                    "role": "assistant",
                    "content": answer,
                    "msg_info": msg_info,
                })
                yield (chunk)
                current_completion += answer

            chat_service.save_chat_log(current_user_id, prompt)
            chat_service.update_conversation(
                conversation_id, current_completion, role, current_user_id, task,user_groups, user_roles, None, task_params,metadata, msg_info, message_id)
        except Exception as e:
            yield (json.dumps({"error": "error"}))
            logging.error("Error in chat completion: "+str(e))
            return
        finally:
            if filepath:
                os.remove(filepath)

    def create_Conversation(prompt, email, task, msg_info, title=None, id=None,task_params=None,metadata=None):
        message = message_obj(
            id=str(uuid.uuid4()),
            role="user",
            content=prompt,
            created=datetime.now(),
            children=[],
            msg_info=msg_info
        )
        acl = acl_obj(
            uid=[],
            gid=[],
            rid=[],
            owner=email
        )

        acl = acl_obj(
            uid=[],
            gid=[],
            rid=[],
            owner=email
        )

        messages = [message]
        conversation = conversation_obj(
            _id=id if id else str(uuid.uuid4()),
            root_message=message['id'],
            last_node=message['id'],
            created=datetime.now(),
            messages=messages,
            user_id=email,
            title=title if title else openai_wrapper.gen_title(prompt, task),
            state='active',
            task=task,
            task_params=task_params,
            metadata=metadata,
            acl=acl
        )
        new_conversation_id = conversation_context.insert_conversation(
            conversation)
        return new_conversation_id

    def update_conversation(conversation_id, content, role, user_id, task,user_groups, user_roles, title=None, task_params=None,metadata=None, msg_info=None, message_id=None):
        conversation = conversation_context.get_conversation_by_id(
            conversation_id, user_id, user_groups, user_roles)
        if conversation is None:
            chat_service.create_Conversation(
                content, user_id, task, msg_info, title, conversation_id, task_params,metadata)
            return
        if (task is None or not task):
            task = conversation['task']
        messages = conversation['messages']
        message = message_obj(
            id=message_id if message_id else str(uuid.uuid4()),
            role=role,
            content=content,
            created=datetime.now(),
            children=[],
            msg_info=msg_info,
            task=task
        )

       # find message with last node id

        for m in messages:
            m['user_action_required'] = False
            if m['id'] == conversation['last_node']:
                m['children'].append(message['id'])
                break

        conversation['last_node'] = message['id']
        conversation['updated'] = datetime.now()
        conversation['task_params'] = task_params
        if metadata is not None:
            conversation['metadata'] = metadata

        messages.append(message)
        conversation_context.update_conversation(conversation_id, conversation)

    def save_chat_log(user_id, text):
        Persistence.insert_chat_log(user_id, text)

    def get_conversations(user_id, flag=False):
        userName = get_current_user_id()
        userGroups = get_current_user_groups()
        userRoles = get_current_user_roles()
        cursor = conversation_context.get_conversations_by_user_email(
            user_id, flag, userName, userGroups, userRoles)
        conversations = {}
        for conversation in cursor:
            conversations =conversation['owned']
        conversations.sort(key=lambda x: x.get('created'), reverse=True)
        return conversations

    def get_conversation_by_id(conversation_id, user_id):
        userName = get_current_user_id()
        userGroups = get_current_user_groups()
        userRoles = get_current_user_roles()
        conversation = conversation_context.get_conversation_by_id(conversation_id, userName, userGroups, userRoles)
        return conversation
    
    def archive_all_conversations(user_id):
        conversation_context.archive_all_conversations(user_id)

    def archive_conversation(user_id, conversation_id, flag=True):
        result = conversation_context.archive_unarchive_conversation(
            user_id, conversation_id, flag)
        return result

    def get_history_for_bot(conversation_id, user_id, user_groups, user_roles):
        conversation = conversation_context.get_conversation_by_id(
            conversation_id, user_id, user_groups, user_roles)
        messages = conversation['messages']
        result = []
        for m in messages:
            if (m['role'] == 'assistant'):
                result.append({"role": "assistant", "content": m['content']})
            elif (m['role'] == 'user'):
                result.append({"role": "user", "content": m['content']})
        return result

    def update_conversation_properties(conversation_id, data, user_id):
       result =  conversation_context.update_conversation_properties(
            conversation_id, data, user_id)
       return result
 
    def update_conversation_acl(conversation_id, acl, user_id):
        result =  conversation_context.update_conversation_acl(
            conversation_id, acl, user_id)
        return result

    def feedback(conversation_id, data, user_id):
        result=conversation_context.get_conversation_by_id(conversation_id,user_id)
        if result is None:
            return {"error": "Conversation not found"}, 404
        messages=result['messages']
        status=False
        for m in messages:
            if m['id']==data['message_id']:
                m['user_feedback']={
                "type":data['user_feedback']['type'],
                "message":data['user_feedback']['message'] if 'message' in data['user_feedback'] else None
                }
                status=True
                break
        if status==False:
            return {"error": "Message ID not found"}, 404
        result=conversation_context.update_conversation(conversation_id,result)
        return {"result": "success"}

