from repo.postgres import SqlAudits
from repo.db import conversation_context
from globals import *

pg_schema = Globals.pg_schema
class admin_service:

    #SqlAudits
    def get_org():
        return SqlAudits.get_org()
    
    def save_org(request_data):
        return SqlAudits.save_org(request_data)
    
    def get_all_list(table_name, sort, range_, filter_):
        table=f'{pg_schema}.{table_name}'
        total_count=SqlAudits.count_query(table, filter_)
        rows=SqlAudits.get_list_query(table, sort, range_, filter_)
          
        data={"data":rows,"totalRows":total_count}
        return data
    
    def get_one_data(table_name, id):
        table=f'{pg_schema}.{table_name}'
        return SqlAudits.get_one_query(table, id)
    
    def update_data(table_name, id, data):
        table=f'{pg_schema}.{table_name}'
        return SqlAudits.update_query(table, id, data)
    
    def insert_data(table_name, data):
        table=f'{pg_schema}.{table_name}'
        return SqlAudits.create_query(table, data)

    #mongodb
    def get_conversation_list(sort, range_, filter_):
        total_count=conversation_context.get_conversation_list_count(filter_)
        conversation_cursor=conversation_context.get_conversation_list(sort, range_, filter_)
        rows = []
        for conversation in conversation_cursor:
            #changing key _id to id because data-grid in admin-ui expects id
            id=conversation['_id']
            conversation.pop('_id')
            conversation['id'] = id
            rows.append(conversation)

        data={"data":rows,"totalRows":total_count}
        return data
    
    def get_conversation_approval_requests_list( user_email,sort, range_, filter_):
        total_count=conversation_context.get_conversation_approval_requests_count(user_email, filter_)
        conversation_cursor=conversation_context.get_conversation_approval_requests(user_email, sort, range_, filter_)
        rows = []
        for conversation in conversation_cursor:
            #changing key _id to id because data-grid in admin-ui expects id
            id=conversation['_id']
            conversation.pop('_id')
            conversation['id'] = id
            rows.append(conversation)

        data={"data":rows,"totalRows":total_count}
        return data

