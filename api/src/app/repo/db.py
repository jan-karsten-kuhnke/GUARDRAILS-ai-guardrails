
from bson.json_util import dumps
from bson.json_util import loads
import pymongo
from bson import ObjectId
from typing import Union

from utils.apiResponse import ApiResponse
from globals import *

uri = Globals.mongo_uri
client = pymongo.MongoClient(uri)
db = client[Globals.mongo_db_name]

conversations_collection = db["conversations"]
analysis_audit_collection = db["analysis_audit"]
anonymize_audit_collection = db["anonymize_audit"]
folders_collection = db["folders"]
prompts_collection = db["prompts"]

def get_filter_parameter(filter_list):
    filter_parameter = {}
    filter_field = filter_list['filterField']
    filter_operator = filter_list['filterOperator']
    filter_value = filter_list['filterValue']

    if(filter_operator=='contains'):
        filter_parameter = {f"{filter_field}": {"$regex": filter_value, "$options": "i"}}
    elif(filter_operator=='equals'):
        filter_parameter = {f"{filter_field}": {"$regex": f"^{filter_value}$", "$options": "i"}}
    elif(filter_operator=='startsWith'):
        filter_parameter = {f"{filter_field}": {"$regex": f"^{filter_value}", "$options": "i"}}
    elif(filter_operator=='endsWith'):
        filter_parameter = {f"{filter_field}": {"$regex": f"{filter_value}$", "$options": "i"}}
    elif(filter_operator=='isEmpty'):
        filter_parameter = {f"{filter_field}": {"$in": [None, ""]}}
    elif(filter_operator=='isNotEmpty'):
        filter_parameter = {filter_field: {"$exists": True, "$ne": ""}}
    elif(filter_operator=='isAnyOf'):
        if(len(filter_value)>0):
            filter_parameter = {filter_field: {"$in": filter_value}}
    
    return filter_parameter

def conversation_pipeline(user_id: Union[ObjectId, str], flag, username, user_groups, user_roles):
    match_query = {}
    
    if flag== None:
        match_query["$match"] = {"_id": user_id, "acl.owner": username}
    elif isinstance(user_id, str) and flag != None:
        match_query["$match"] = {"user_id": user_id, "archived": flag, "acl.owner": username}
    
    print(match_query)
    project_stage = {
        "$project": {
            "acl": 0
        }
    }
    facet_stage = {
        "$facet": {
            "shared": [
                {
                    "$match": {
                        "archived": flag,
                        "$or": [
                            {"acl.gid": {"$in": user_groups}},
                            {"acl.rid": {"$in": user_roles}},
                            {"acl.uid": {"$in": [username]}}
                        ]
                    }
                },project_stage
            ],
            "owned": [
                match_query,project_stage
            ]
        }
    }
    if flag== None:
        facet_stage["$facet"]["shared"][0]["$match"].pop("archived", None)


    print(facet_stage)
    
    pipeline = [facet_stage]
    return pipeline

class conversation_context:
    def insert_conversation(conversation):
        conversation['archived'] = False
        result = conversations_collection.insert_one(conversation) 
        return result.inserted_id

    def get_conversation_by_id(conversation_id,  username, user_groups, user_roles):
        pipeline  = conversation_pipeline(conversation_id, None, username, user_groups, user_roles)
        results = conversations_collection.aggregate(pipeline)
        return results
    
    def get_conversations_by_user_email(user_id,flag, username, user_groups, user_roles):
        pipeline  = conversation_pipeline(user_id,flag, username, user_groups, user_roles)
        results = conversations_collection.aggregate(pipeline)
        return loads(dumps(results))

    def update_conversation(conversation_id, conversation):
        conversations_collection.update_one({"_id":conversation_id}, {"$set":conversation})

    def archive_all_conversations(user_id):
        conversations_collection.update_many({"user_id":user_id}, {"$set":{"archived":True}})
    
    def archive_unarchive_conversation(user_id,conversation_id,flag = True):
        result = conversations_collection.find_one_and_update({"user_id":user_id, "_id" : conversation_id}, {"$set":{"archived":flag}})
        return result
    
    def update_conversation_properties(conversation_id,data,user_id):
       result =  conversations_collection.update_one({"_id":conversation_id, "user_id":user_id}, {"$set":{"folderId":data['folderId'], "title":data['title']}})
       return result
    def request_approval(conversation_id,group_managers_emails):
        conversations_collection.update_one({"_id":conversation_id}, {"$set":{"state":"waiting for approval","assigned_to":group_managers_emails}})



    #conversation_logs admin-ui

    def get_conversation_list(sort, range_, filter_):
        response=ApiResponse()
        try:
            #sort
            sort_list = eval(sort)
            sort_field_name = sort_list[0]
            sort_value = 1 if sort_list[1] == "asc" else -1

            #range
            range_list = eval(range_)
            start = range_list[0]
            end = range_list[1]

            #filter
            filter_list = eval(filter_)
            filter_parameter = {}
            if(len(filter_list)!=0):
                filter_parameter = get_filter_parameter(filter_list)
            
            cursor=conversations_collection.find(filter_parameter).sort(sort_field_name,sort_value).hint([(sort_field_name,sort_value)]).skip(start).limit(end-start+1)
            rows = []
            for conversation in cursor:
                #changing key _id to id because data-grid in admin-ui expects id
                id=conversation['_id']
                conversation.pop('_id')
                conversation['id'] = id
                rows.append(conversation)
            response.update(True,"Successfully retrieved the data",rows)
        except Exception as ex:
            logging.info(f"Exception while getting list: {ex}")
            response.update(False,"Error in retrieving the data",None)

        return response.json()



    def get_conversation_list_count(filter_):
        response=ApiResponse()
        try:
            filter_list = eval(filter_)
            filter_parameter = {}
            if(len(filter_list)!=0):
                filter_parameter = get_filter_parameter(filter_list)
            
            data= conversations_collection.count_documents(filter_parameter)
            response.update(True,"Successfully retrieved the data",data)
        
        except Exception as ex:
            logging.info(f"Exception while getting list: {ex}")
            response.update(False,"Error in retrieving the data",None)
        return response.json()
        
    def get_conversation_approval_requests(user_id, sort, range_, filter_):
        response=ApiResponse()
        try:
                
            #sort
            sort_list = eval(sort)
            sort_field_name = sort_list[0]
            sort_value = 1 if sort_list[1] == "asc" else -1

            #range
            range_list = eval(range_)
            start = range_list[0]
            end = range_list[1]

            #filter
            filter_list = eval(filter_)
            filter_parameter = {}
            if(len(filter_list)!=0):
                filter_parameter = get_filter_parameter(filter_list)

            conditions = {
                "$and": [
                    { "state":"waiting for approval", 'assigned_to': { "$in": [user_id] } },
                    filter_parameter
                ]
            }

            cursor = conversations_collection.find(conditions).sort(sort_field_name,sort_value).hint([(sort_field_name,sort_value)]).skip(start).limit(end-start+1)
            rows = []
            for conversation in cursor:
                #changing key _id to id because data-grid in admin-ui expects id
                id=conversation['_id']
                conversation.pop('_id')
                conversation['id'] = id
                rows.append(conversation)
            response.update(True,"Successfully retrieved the data",rows)
        
        except Exception as ex:
            logging.info(f"Exception while getting list: {ex}")
            response.update(False,"Error in retrieving the data",None)
        return response.json()

    def get_conversation_approval_requests_count(user_id, filter_):
        response=ApiResponse()
        try:
            filter_list = eval(filter_)
            filter_parameter = {}
            if(len(filter_list)!=0):
                filter_parameter = get_filter_parameter(filter_list)

            conditions = {
                "$and": [
                    { "state":"waiting for approval", 'assigned_to': { "$in": [user_id] } },
                    filter_parameter
                ]
            }

            data= conversations_collection.count_documents(conditions)
            response.update(True,"Successfully retrieved the data",data)
        
        except Exception as ex:
            logging.info(f"Exception while getting list: {ex}")
            response.update(False,"Error in retrieving the data",None)
        return response.json()


    def approve_escalation(conversation_id):
        response = ApiResponse()
        try:
            conversations_collection.update_one({"_id":conversation_id}, {"$set":{"state":"active"}})
            response.update(True,"Successfully approved",None)
            
        except Exception as ex:
            logging.info(f"Exception while getting list: {ex}")
            response.update(False,"Error in approving",None)
        return response.json()

    def reject_escalation(conversation_id):
        response = ApiResponse()
        try:
            conversations_collection.update_one({"_id":conversation_id}, {"$set":{"state":"locked","archived":True}})
            response.update(True,"Successfully rejected",None)
            
        except Exception as ex:
            logging.info(f"Exception while getting list: {ex}")
            response.update(False,"Error in rejecting",None)
        return response.json()






class analysis_audit_context:
    def insert_analysis_audit(analysis_audit):
        result = analysis_audit_collection.insert_one(analysis_audit) 
        return result.inserted_id
    

class anonymize_audit_context:
    def insert_anonymize_audit(analysis_audit):
        result = anonymize_audit_collection.insert_one(analysis_audit) 
        return result.inserted_id
    
