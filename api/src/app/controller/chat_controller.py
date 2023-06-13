from flask import Flask, Blueprint, Response
from flask_restful import Resource, Api, reqparse, request
from service.chat_service import chat_service
from flask_smorest import Blueprint as SmorestBlueprint

# import time
from oidc import oidc
from oidc import get_current_user_email
from oidc import get_current_user_groups
from utils.util import utils

endpoints = SmorestBlueprint('chatbot', __name__)

@endpoints.route('/analyze', methods=['POST'])
@oidc.accept_token(require_token=True)
def analyze(): 
    data = request.get_json(silent=True)
    message = chat_service.analyze(data['message']) 
    return message


@endpoints.route('/anonymize', methods=['POST'])
@oidc.accept_token(require_token=True)
def anonymize(): 
    data = request.get_json(silent=True)
    message = chat_service.anonymize(data['message']) 
    return {"result":message} 


@endpoints.route('/completions', methods=['POST'])
@oidc.accept_token(require_token=True)
def chat_completion():
    data = request.get_json(silent=True)
    user_email = get_current_user_email()
    def chat_completion_stream(data,user_email):
        response = chat_service.chat_completion(data,user_email)
        for chunk in response:
            yield chunk
    return Response(chat_completion_stream(data,user_email), mimetype='text/event-stream')

@endpoints.route('/conversations', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_conversations():
    archived_param = request.args.get('archived')
    flag = archived_param.lower() == 'true'
    user_email = get_current_user_email()
    conversations = chat_service.get_conversations(user_email,flag)
    return utils.rename_id(conversations)

@endpoints.route('/conversations/<conversation_id>', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_conversation_by_id(conversation_id):
    user_email = get_current_user_email()
    return chat_service.get_conversation_by_id(conversation_id,user_email)


@endpoints.route('/conversations/archive', methods=['DELETE'])
@oidc.accept_token(require_token=True)
def archive_all_conversations():
    user_email = get_current_user_email()
    chat_service.archive_all_conversations(user_email)
    return {"result":"success"}



@endpoints.route('/conversations/archive/<conversation_id>', methods=['DELETE'])
@oidc.accept_token(require_token=True)
def archive_conversation(conversation_id):
    archived_param = request.args.get('flag')
    flag = archived_param.lower() == 'true'
    user_email = get_current_user_email()
    chat_service.archive_conversation(user_email, conversation_id,flag=flag)
    return {"result":"success"}


@endpoints.route('/folders', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_folder_data():
    user_email = get_current_user_email()
    result = chat_service.get_all_folders(user_email)
    return result if result else {}
    



@endpoints.route('/folders', methods=['PUT'])
@oidc.accept_token(require_token=True)
def upsert_folders():
    data = request.get_json(silent=True)
    user_email = get_current_user_email()
    chat_service.upsert_folders(data,user_email)
    return {"result":"success"}



@endpoints.route('/prompts', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_prompts_data():
    user_email = get_current_user_email()
    result = chat_service.get_all_prompts(user_email)
    return result if result else {}
    



@endpoints.route('/prompts', methods=['PUT'])
@oidc.accept_token(require_token=True)
def upsert_prompts():
    data = request.get_json(silent=True)
    user_email = get_current_user_email()
    chat_service.upsert_prompts(data,user_email)
    return {"result":"success"}


@endpoints.route('/conversations/<conversation_id>/properties', methods=['PUT'])
@oidc.accept_token(require_token=True)
def update_conversation_properties(conversation_id):
    data = request.get_json(silent=True)
    user_email = get_current_user_email()
    chat_service.update_conversation_properties(conversation_id,data,user_email)
    return {"result":"success"}


@endpoints.route('/requestapproval/<conversationId>', methods=['GET'])
@oidc.accept_token(require_token=True)
def request_approval(conversationId):
    user_email = get_current_user_email()
    user_groups = get_current_user_groups()
    message=chat_service.request_approval(conversationId,user_email,user_groups)
    return {"message":message}



