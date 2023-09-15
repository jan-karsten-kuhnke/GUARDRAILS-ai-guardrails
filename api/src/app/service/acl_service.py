from database.repository import Persistence
from repo.db import conversation_context
from oidc import get_current_user_id
from oidc import get_current_user_groups
from oidc import get_current_user_roles
from database.postgres import Session, engine
from database.models import AclEntity

class acl_service:
    def update_acl(entity_type, id, data):
        user_id = get_current_user_id()
        if len(data['owner']) == 0:
            data['owner'] = user_id
        if entity_type == 'conversation':
            conversation = conversation_context.get_conversation_by_id_user_id(id, user_id)
            if conversation is None:
                return None, 404
            
            acl = conversation['acl']
            if acl is None:
                pass
            keysList = [key for key in data.keys()]
            for key in keysList:
                array = data[key] 
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
            res =  conversation_context.update_conversation_acl(id, acl,user_id)
            res['message'] ="access provided" if data['is_provide_access'] else "access removed"
            return res
        elif entity_type == 'chain':
            return Persistence.update_acl_list(id,entity_type,data)
        elif entity_type == 'data_source':
            return Persistence.update_acl_list(id,entity_type,data)
        
