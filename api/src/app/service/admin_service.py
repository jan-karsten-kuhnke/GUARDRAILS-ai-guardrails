from database.repository import Persistence
from repo.db import conversation_context
from globals import *
from service.chat_service import chat_service
from integration.flowable_wrapper import flowable_wrapper
from database.postgres import Session
from database.models import ChainEntity
from utils.encryption import Encryption
from oidc import get_current_user_id
from oidc import get_current_user_groups
from oidc import get_current_user_roles

pg_schema = Globals.pg_schema
class admin_service:

    def get_org():
        return Persistence.get_org()
    
    def save_org(request_data):
        return Persistence.save_org(request_data)
    
    def get_all_list(Entity, sort, range_, filter_):
        return Persistence.get_list_query(Entity, sort, range_, filter_)
    

    def get_one_data(Entity, id):
        return Persistence.get_one_query(Entity, id)
    
    def update_data(Entity, id, data):
        return Persistence.update_query(Entity, id, data)
    
    def insert_data(Entity, data):
        return Persistence.create_query(Entity, data)
    
    def insert_data_source(data):
        name = data['name']
        user_id = get_current_user_id()
        encrypted_connection_string = Encryption.encrypt(data['connection_string'])

        schemas = data['schemas'] if 'schemas' in data else []
        tables_to_include = data['tables_to_include'] if 'tables_to_include' in data else []
        custom_schema_description = data['custom_schema_description'] if 'custom_schema_description' in data else ""

        return Persistence.insert_data_source(name=name, connection_string=encrypted_connection_string, user_id=user_id, schemas=schemas, tables_to_include=tables_to_include, custom_schema_description=custom_schema_description)

    def update_data_source(id, data):
        name = data['name'] if 'name' in data else None
        
        encrypted_connection_string = Encryption.encrypt(data['connection_string']) if 'connection_string' in data else None

        schemas = data['schemas'] if 'schemas' in data else None
        tables_to_include = data['tables_to_include'] if 'tables_to_include' in data else None
        custom_schema_description = data['custom_schema_description'] if 'custom_schema_description' in data else None

        return Persistence.update_data_source(id=id, name=name, connection_string=encrypted_connection_string, schemas=schemas, tables_to_include=tables_to_include, custom_schema_description=custom_schema_description)

    def get_all_data_source():
        userName = get_current_user_id()
        userGroups = get_current_user_groups()
        userRoles = get_current_user_roles()
        return Persistence.get_all_data_source(userName, userGroups, userRoles)

    #mongodb
    def get_conversation_list(sort, range_, filter_):
        total_count=conversation_context.get_conversation_list_count(filter_)
        rows=conversation_context.get_conversation_list(sort, range_, filter_)
        
        if total_count['success'] and rows['success']:
            data={"rows":rows['data'],"totalRows":total_count['data']}
            return {"data":data,"success":True,"message":"Successfully retrieved the data"}
        else:
            return {"data":{},"success":False,"message":"Error in retrieving the data"}
    
    def get_conversation_approval_requests_list( user_id,sort, range_, filter_):
        total_count=conversation_context.get_conversation_approval_requests_count(user_id, filter_)
        rows=conversation_context.get_conversation_approval_requests(user_id, sort, range_, filter_)

        if total_count['success'] and rows['success']:
            data={"rows":rows['data'],"totalRows":total_count['data']}
            return {"data":data,"success":True,"message":"Successfully retrieved the data"}
        else:
            return {"data":{},"success":False,"message":"Error in retrieving the data"}

    def approve_escalation(conversation_id, user_id):
        data=conversation_context.approve_escalation(conversation_id)
        message = f"Request Approved by: {user_id}"
        chat_service.update_conversation(conversation_id,message,'guardrails',user_id,task=None,user_action_required=False)
        return data

    def reject_escalation(conversation_id, user_id):
        data=conversation_context.reject_escalation(conversation_id)
        message = f"Request Rejected by: {user_id}"
        chat_service.update_conversation(conversation_id,message,'guardrails',user_id,task=None,user_action_required=False)
        return data


    def get_all_access_request_list():
        try:
            data =  flowable_wrapper.get_requests_for_admin()
            session = Session()
            all_chains = session.query(ChainEntity).all()
            chains = [chain.to_dict() for chain in all_chains]

            for d in data:
                for chain in chains:
                    if d['tile'] == chain['code']:
                        d['tile_name'] = chain['title']
                        break
                    
            sorted_data = sorted(data, key=lambda item:(item["status"]), reverse=True)
            formatted_data={"rows":sorted_data,"totalRows":len(data)}
            return {"data":formatted_data,"success":True,"message":"Successfully retrieved the data"}
        except Exception as ex:
            logging.error(f"Exception getting all access request list: {ex}")
            return {"data":{},"success":False,"message":"Error in retrieving the data"}
        finally: 
            session.close()
    
    def complete_request(request_id, approved:bool):
        flowable_wrapper.complete_request(request_id, approved)
        return {"success":True,"message":"Successfully completed the request"}
    
    def insert_chain(title, icon, code, params, active, group_code):
        user_id = get_current_user_id()
        return Persistence.insert_chain(title, icon, code, params, active, group_code, user_id)
    
    def update_chain(id,data):
        return Persistence.update_chain(id,data)