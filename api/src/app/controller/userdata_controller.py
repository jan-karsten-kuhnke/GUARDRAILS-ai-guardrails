from flask import Flask, Blueprint, Response,jsonify
from flask_restful import Resource, Api, reqparse, request
from service.userdata_service import userdata_service
from flask_smorest import Blueprint as SmorestBlueprint
from oidc import oidc
from oidc import get_current_user_email
from utils.util import validate_fields

userdataendpoints = SmorestBlueprint('user', __name__)


@userdataendpoints.route('/folders', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_folder_data():
    user_email = get_current_user_email()
    result = userdata_service.get_all_folders(user_email)
    return result if result else {}
    



@userdataendpoints.route('/folders', methods=['PUT'])
@oidc.accept_token(require_token=True)
def upsert_folders():
    try:
        data = request.get_json(silent=True)
        validation_result = validate_fields(data, ['id', 'name', 'type'])
        if validation_result:
            return validation_result

        user_email = get_current_user_email()
        userdata_service.upsert_folders(data, user_email)
        return {"result": "success"}
    
    except Exception as e:
        # Handle general exceptions
        return jsonify(error="An error occurred"), 500



@userdataendpoints.route('/prompts', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_prompts_data():
    user_email = get_current_user_email()
    result = userdata_service.get_all_prompts(user_email)
    return result if result else {}
    



@userdataendpoints.route('/prompts', methods=['PUT'])
@oidc.accept_token(require_token=True)
def upsert_prompts():
    try:
        data = request.get_json(silent=True)
        validation_result = validate_fields(data, ['id','name'])
        if validation_result:
            return validation_result
        
        user_email = get_current_user_email()
        userdata_service.upsert_prompts(data,user_email)
        return {"result":"success"}

    except Exception as e:
        # Handle general exceptions
        return jsonify(error="An error occurred"), 500


@userdataendpoints.route('/tiles', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_tiles():
    user_email = get_current_user_email()
    return userdata_service.get_tiles(user_email)


@userdataendpoints.route('/tiles/<code>', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_tile_by_code(code):
    user_email = get_current_user_email()
    return userdata_service.get_tile_by_code(user_email,code)


@userdataendpoints.route('/access_request', methods=['POST'])
@oidc.accept_token(require_token=True)
def request_access():
    try:
        data = request.get_json()
        validation_result = validate_fields(data, ['tile_code', 'tile_name'])
        if validation_result:
            return validation_result
        
        user_email = get_current_user_email()
        return userdata_service.request_tile_by_code(user_email,data['tile_code'],data['tile_name'])
    
    except Exception as e:
        # Handle general exceptions
        return jsonify(error="An error occurred"), 500

@userdataendpoints.route('/eula', methods=['GET'])
@oidc.accept_token(require_token=True)
def get_eula_status():
    user_email = get_current_user_email()
    result = userdata_service.get_eula_status(user_email)
    return result 

@userdataendpoints.route('/eula', methods=['POST'])
@oidc.accept_token(require_token=True)
def set_eula_status():
    user_email = get_current_user_email()
    result = userdata_service.set_eula_status(user_email)
    return result 
    
    