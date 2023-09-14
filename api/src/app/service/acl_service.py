from database.repository import Persistence
from repo.db import conversation_context
from oidc import get_current_user_id
from oidc import get_current_user_groups
from oidc import get_current_user_roles

class acl_service:
    def update_acl(entity_type, id, data):
        userName = get_current_user_id()
        if entity_type == 'conversation':
            conversation = conversation_context.get_conversation_by_id_user_id(id, userName)
            if conversation is None:
                return None, 404
            
            acl = conversation['acl']
            print(acl)
            if acl is None:
                pass
            print(type(data))
            keysList = [key for key in data.keys()]
            for key in keysList:
                array = data[key] 
                print(type(array))
                if isinstance(array, list) :
                    if data['is_provide_access']:
                        acl[key].extend(array)
                    else:
                        for item in array:
                            if item in acl[key]:
                                acl[key].remove(item)
                elif isinstance(array, str):
                    if data['is_provide_access']:
                        acl[key] = array
                    else:
                        acl[key] = "" 
            print(acl)  
            return conversation_context.update_conversation_acl(id, acl)
        elif entity_type == 'chain':
            return Persistence.update_chain_acl(id,entity_type,data)
        elif entity_type == 'data-source':
            return Persistence.update_data_source_acl(id,entity_type,data)
        
        return Persistence.update_acl(data)
