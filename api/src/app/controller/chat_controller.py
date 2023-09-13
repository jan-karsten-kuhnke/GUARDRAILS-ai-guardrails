from flask import Flask, Blueprint, Response, jsonify
from flask_restful import Resource, Api, reqparse, request
from service.chat_service import chat_service
from flask_smorest import Blueprint as SmorestBlueprint
from time import time
import os
from oidc import oidc
from oidc import get_current_user_id
from utils.util import rename_id
import json
from utils.util import validate_fields
endpoints = SmorestBlueprint('chat', __name__)

@endpoints.route('/completions', methods=['POST'])
@oidc.accept_token(require_token=True)
def chat_completion():
    try:
        data = request.get_json(silent=True)
        data.setdefault('isOverride', False)
        required_fields = ['message', 'conversation_id', 'task', 'task_params']
        validation_result = validate_fields(data, required_fields)
        if validation_result:
            return validation_result
        user_id = get_current_user_id()
        token = request.headers.get('authorization', '').split(' ')[1]

        def chat_completion_stream(data, user_id):
            response = chat_service.chat_completion(data, user_id, token)
            for chunk in response:
                yield chunk
        return Response(chat_completion_stream(data, user_id), mimetype='text/event-stream')

    except Exception as e:
        # Handle general exceptions
        return jsonify(error="An error occurred: " + str(e)), 500


@endpoints.route('/conversations', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_conversations():
    archived_param = request.args.get('archived')
    flag = archived_param.lower() == 'true' if archived_param else False
    user_id = get_current_user_id()
    conversations = chat_service.get_conversations(user_id, flag)
    return rename_id(conversations)


@endpoints.route('/conversations/<conversation_id>', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_conversation_by_id(conversation_id):
    user_id = get_current_user_id()
    result = chat_service.get_conversation_by_id(conversation_id, user_id)
    if result is None:
        return jsonify(error="Conversation not found"),404
    return rename_id(result)


@endpoints.route('/conversations/archive', methods=['DELETE'])
@oidc.accept_token(require_token=True)
def archive_all_conversations():
    user_id = get_current_user_id()
    chat_service.archive_all_conversations(user_id)
    return {"result": "success"}


@endpoints.route('/conversations/archive/<conversation_id>', methods=['DELETE'])
@oidc.accept_token(require_token=True)
def archive_conversation(conversation_id):
    archived_param = request.args.get('flag')
    flag = archived_param.lower() == 'true' if archived_param else False
    user_id = get_current_user_id()
    result = chat_service.archive_conversation(user_id, conversation_id, flag=flag)
    if result is None:
        return jsonify(error="Conversation not found"), 404
    return {"result": "success"}


@endpoints.route('/conversations/<conversation_id>/properties', methods=['PUT'])
@oidc.accept_token(require_token=True)
def update_conversation_properties(conversation_id):
    data = request.get_json(silent=True)
    required_fields = ['title', 'folderId']
    validation_result = validate_fields(data, required_fields)
    if validation_result:
        return validation_result
    
    user_id = get_current_user_id()
    result = chat_service.update_conversation_properties(
        conversation_id, data, user_id)
    if result.matched_count == 0:
        return jsonify(error="Conversation not found"), 404
    return {"result": "success"}

@endpoints.route('/conversations/<conversation_id>/acl', methods=['PUT'])
@oidc.accept_token(require_token=True)
def update_conversation_acl(conversation_id):
    acl = request.get_json(silent=True)
    user_id = get_current_user_id()
    result = chat_service.update_conversation_acl(
        conversation_id, acl, user_id)
    if result.matched_count == 0:
        return jsonify(error="Conversation not found"), 404
    return {"result": "Succesfully updated conversation acl", "success": True}

@endpoints.route('/executeondoc', methods=['POST'])
@oidc.accept_token(require_token=True)
def execute_on_document():
    try:
        data = json.loads(request.form['data'])
        data.setdefault('isOverride', False)
        required_fields = ['conversation_id', 'task', 'task_params']
        validation_result = validate_fields(data, required_fields)
        if validation_result:
            return validation_result

        user_id = get_current_user_id()
        token = request.headers['authorization'].split(' ')[1]
        files = request.files.getlist('files')
        if len(files) == 0 or files[0].filename == '':
            return jsonify(error="Missing file"), 400
        file = files[0]
        # save file to disk
        temp_dir_name = "temp-" + str(time())
        os.mkdir(temp_dir_name)
        filename = file.filename
        filepath = os.path.join(os.path.join(temp_dir_name, file.filename))
        file.save(filepath)
        file.close()

        def summarize_brief_stream(data, user_id, token, filename, filepath):
            response = chat_service.chat_completion(
                data, user_id, token, filename, filepath)
            for chunk in response:
                yield chunk
        return Response(summarize_brief_stream(data, user_id, token, filename, filepath), mimetype='text/event-stream')

    except Exception as e:
        return jsonify(error="An error occurred: " + str(e)), 500