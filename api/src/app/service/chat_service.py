import os
import logging
from oidc import get_current_user_email
from repo.db import conversation_context
from database.repository import Persistence
from integration.openai_wrapper import openai_wrapper
from integration.presidio_wrapper import presidio_wrapper
from presidio_anonymizer.entities import RecognizerResult
from integration.nsfw_model_wrapper import NSFWModelWrapper
from integration.keycloak_wrapper import keycloak_wrapper
from service.pii_service import pii_service
from service.document_service import DocumentService
import uuid
from typing import TypedDict, Optional
from datetime import datetime
import json
import requests
from executors.applet.Summarize import Summarize
from executors.applet.Extraction import Extraction
from executors.applet.Conversation import Conversation
from executors.applet.QaRetrieval import QaRetrieval
from executors.applet.Sql import Sql
from executors.applet.Visualization import Visualization

override_message = "You chose to Override the warning, proceeding to Open AI."
nsfw_warning = "Warning From Guardrails: We've detected that your message contains NSFW content. Please refrain from posting such content in a work environment, You can choose to override this warning if you wish to continue the conversation, or you can get your manager's approval before continuing."


class conversation_obj(TypedDict):
    _id: str
    title: str
    root_message: str
    last_node: str
    is_active: bool
    messages: list
    created: datetime
    updated: datetime
    user_email: str
    state: str
    assigned_to: list
    task: str


class message_obj(TypedDict):
    id: str
    role: str
    content: str
    created: datetime
    children: list
    user_action_required: bool
    msg_info: Optional[dict]
    task: str


class chat_service:

    def chat_completion(data, current_user_email, token, filename=None, filepath=None):
        try:
            task = str(data["task"]) if "task" in data else None
            task_params=data["params"] if "params" in data else None
            document_id =task_params["documentId"] if "documentId" in task_params else None
            collection_name = task_params["collectionName"] if "collectionName" in task_params else None
            qa_document_id=task_params["qaDocumentId"] if "qaDocumentId" in task_params else None
            
            is_private = bool(
                data["isPrivate"]) if "isPrivate" in data else False
            pii_scan = True
            nsfw_scan = True
            
            if task is None:
                yield (json.dumps({"error": "Invalid task"}))
                return
                
            #getting chain from db
            chain = Persistence.get_chain_by_code(task)
            params = chain['params']
        
           
            #Summarize/Extraction on already uploaded document
            is_document_uploaded=False
            document_array=[]

            if document_id:
                document_obj=Persistence.get_pgvector_document_by_id(document_id)
                is_document_uploaded=True
                filename=document_obj['metadata']['title']
                document_array=document_obj['docs']

            is_override = bool(data["isOverride"])
            conversation_id = None
            manage_conversation_context = False

            # if(task == "conversation" or task == "qa-retreival"):
            is_override = True

            if task == "summarize-brief":
                prompt = f"Summarize {filename}"
                title = f"Summmary of {filename}."
            elif task == "extraction":
                prompt = f"Extract Key Metrics from {filename}"
                title = f"Key Metrics of {filename}."
            else:
                prompt = str(data["message"]) if "message" in data else "Task."
                title = None

            if ('conversation_id' in data and data['conversation_id']):
                conversation_id = data['conversation_id']
                manage_conversation_context = True

            stop_conversation, stop_response, updated_prompt, role = chat_service.validate_prompt(
                prompt, is_override, pii_scan, nsfw_scan, current_user_email, conversation_id)
            chat_service.update_conversation(
                conversation_id, updated_prompt, 'user', current_user_email, task, title)

            current_completion = ''
            user_action_required = False
            msg_info = None

            if stop_conversation:

                chunk = json.dumps({
                    "role": "guardrails",
                    "content": stop_response,
                    "user_action_required": True
                })
                yield (chunk)

                current_completion = stop_response
                role = "guardrails"
                user_action_required = True
            else:
                messages = []
                role = "assistant"
                if (manage_conversation_context):
                    messages = chat_service.get_history_for_bot(
                        conversation_id, current_user_email)

                is_private = False
                history = []
                if len(messages) > 1:
                    for i in range(len(messages)-1):
                        if (messages[i]['role'] == 'user'):
                            history.append(
                                (messages[i]['content'], messages[i+1]['content']))

                res = None
                executor = params['executor']
                
                if (executor == "summarize"):
                    try:
                        logging.info("calling summarize brief executor")
                        if(not is_document_uploaded):
                            DocumentService.create_document(filename,filepath)
                        executor_instance = Summarize()
                        res = executor_instance.execute(filepath=filepath,document_array=document_array,is_document_uploaded=is_document_uploaded, params=params)

                    except Exception as e:
                        yield ("Sorry. Some error occured. Please try again.")
                        logging.error("error: "+str(e))

                elif (executor == "extraction"):
                    try:
                        if(not is_document_uploaded):
                            DocumentService.create_document(filename,filepath)
                        executor_instance = Extraction()
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
                        if qa_document_id:
                            document_obj=Persistence.get_document_by_id(qa_document_id)
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

                else:
                    yield (json.dumps({"error": "Invalid executor"}))

                answer = res['answer']

                msg_info = {
                    "sources": res['sources'] if 'sources' in res else [],
                    "visualization": res['visualization'] if 'visualization' in res else None,
                    "dataset": res['dataset'] if 'dataset' in res else None,
                }
                chunk = json.dumps({
                    "role": "assistant",
                    "content": answer,
                    "msg_info": msg_info,
                })
                yield (chunk)
                current_completion += answer

            chat_service.save_chat_log(current_user_email, updated_prompt)
            chat_service.update_conversation(
                conversation_id, current_completion, role, current_user_email, task, None, msg_info, user_action_required)
        except Exception as e:
            yield (json.dumps({"error": "error"}))
            logging.error("Error in chat completion: "+str(e))
            return
        finally:
            if filepath:
                os.remove(filepath)

    def validate_prompt(prompt, is_override, pii_scan, nsfw_scan, current_user_email, conversation_id):
        logging.info("pii_scan: ", pii_scan)
        logging.info("nsfw_scan: ", nsfw_scan)
        stop_conversation = False
        stop_response = ""
        role = "guardrails"
        nsfw_threshold = 0.94

        if (is_override):
            return stop_conversation, stop_response, prompt, role

        if (nsfw_scan):
            nsfw_score = NSFWModelWrapper.analyze(prompt)
            if nsfw_score > nsfw_threshold:
                stop_response = nsfw_warning
                stop_conversation = True
                logging.info("returning from nsfw")
                return stop_conversation, stop_response, prompt, role

        if (pii_scan):
            updated_prompt = pii_service.anonymize(
                prompt, current_user_email, conversation_id)
            stop_conversation = False

            logging.info("returning from pii")
            return stop_conversation, stop_response, updated_prompt, role

    def create_Conversation(prompt, email, model, msg_info, title=None, id=None,):
        task = model
        message = message_obj(
            id=str(uuid.uuid4()),
            role="user",
            content=prompt,
            created=datetime.now(),
            children=[],
            msg_info=msg_info
        )

        messages = [message]
        conversation = conversation_obj(
            _id=id if id else str(uuid.uuid4()),
            root_message=message['id'],
            last_node=message['id'],
            created=datetime.now(),
            messages=messages,
            user_email=email,
            title=title if title else openai_wrapper.gen_title(prompt, model),
            model_name=model,
            state='active',
            assigned_to=[],
            task=task
        )
        new_conversation_id = conversation_context.insert_conversation(
            conversation)
        return new_conversation_id

    def update_conversation(conversation_id, content, role, user_email, model, title=None, msg_info=None, user_action_required=False):
        conversation = conversation_context.get_conversation_by_id(
            conversation_id, user_email)
        if (conversation == None):
            chat_service.create_Conversation(
                content, user_email, model, msg_info, title, conversation_id)
            return
        if (model is None or not model):
            model = conversation['model']
        messages = conversation['messages']
        message = message_obj(
            id=str(uuid.uuid4()),
            role=role,
            content=content,
            created=datetime.now(),
            children=[],
            user_action_required=user_action_required,
            msg_info=msg_info,
            task=model
        )

       # find message with last node id

        for m in messages:
            m['user_action_required'] = False
            if m['id'] == conversation['last_node']:
                m['children'].append(message['id'])
                break

        conversation['last_node'] = message['id']
        conversation['updated'] = datetime.now()
        conversation['model'] = model

        messages.append(message)
        conversation_context.update_conversation(conversation_id, conversation)

    def save_chat_log(user_email, text):
        Persistence.insert_chat_log(user_email, text)

    def get_conversations(user_email, flag=False):
        cursor = conversation_context.get_conversations_by_user_email(
            user_email, flag)
        conversations = []
        for conversation in cursor:
            conversations.append(conversation)
        conversations.sort(key=lambda x: x.get('created'), reverse=True)
        return conversations

    def get_conversation_by_id(conversation_id, user_email):
        return conversation_context.get_conversation_by_id(conversation_id, user_email)

    def archive_all_conversations(user_email):
        conversation_context.archive_all_conversations(user_email)

    def archive_conversation(user_email, conversation_id, flag=True):
        conversation_context.archive_unarchive_conversation(
            user_email, conversation_id, flag)

    def get_history_for_bot(conversation_id, user_email):
        conversation = conversation_context.get_conversation_by_id(
            conversation_id, user_email)
        messages = conversation['messages']
        result = []
        for m in messages:
            if (m['role'] == 'assistant'):
                result.append({"role": "assistant", "content": m['content']})
            elif (m['role'] == 'user'):
                result.append({"role": "user", "content": m['content']})
        return result

    def update_conversation_properties(conversation_id, data, user_email):
        conversation_context.update_conversation_properties(
            conversation_id, data, user_email)

    def request_approval(conversation_id, user_email, user_groups):
        # needs to be updated for multiple groups
        current_group = user_groups[0]
        group_managers = keycloak_wrapper.get_users_by_role_and_group(
            "manager", current_group)
        group_managers_emails = [user['email'] for user in group_managers]
        conversation_context.request_approval(
            conversation_id, group_managers_emails)

        csv_email = ','.join(group_managers_emails)
        message = f"Request sent for approval to: {csv_email}"
        chat_service.update_conversation(conversation_id, message, 'guardrails',
                                         user_email, model=None, msg_info=None, user_action_required=False)
        return message
