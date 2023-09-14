from database.repository import Persistence


class acl_service:

    def update_entity_acl(id, entity_name, data):
        if entity_name == 'chain':
            return Persistence.update_chain_acl(id, data)
        elif entity_name == 'data_source':
            return Persistence.update_data_source_acl(id, data)
