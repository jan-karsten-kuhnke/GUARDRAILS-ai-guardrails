from repo.postgres import sql_audits
from repo.db import conversation_context
from globals import *

pg_schema = Globals.pg_schema
class admin_service:

    #sql_audits
    def getorg():
        return sql_audits.getorg()
    
    def saveorg(request_data):
        return sql_audits.saveorg(request_data)
    
    def get_all_list(table_name, sort, range_, filter_):
        table=f'{pg_schema}.{table_name}'
        total_count=sql_audits.count_query(table, filter_)
        rows=sql_audits.get_list_query(table, sort, range_, filter_)
          
        data={"data":rows,"totalRows":total_count}
        return data
    
    def get_one_data(table_name, id):
        table=f'{pg_schema}.{table_name}'
        return sql_audits.get_one_query(table, id)
    
    def update_data(table_name, id, data):
        table=f'{pg_schema}.{table_name}'
        return sql_audits.update_query(table, id, data)
    
    def insert_data(table_name, data):
        table=f'{pg_schema}.{table_name}'
        return sql_audits.create_query(table, data)

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