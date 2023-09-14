from database.repository import Persistence
from repo.db import conversation_context
from oidc import get_current_user_id
from oidc import get_current_user_groups
from oidc import get_current_user_roles

class acl_service:
    def update_acl(entity_type, id, data):
        userName = get_current_user_id()
        userGroups = get_current_user_groups()
        userRoles = get_current_user_roles()
        if entity_type == 'conversation':
            conversation = conversation_context.get_conversation_by_id(id, userName, userGroups, userRoles)
            return conversation_context.update_conversation_acl(id, data)
        elif entity_type == 'chain':
            return Persistence.update_acl(data)
        elif entity_type == 'data-source':
            return Persistence.update_acl(data)
        
        return Persistence.update_acl(data)