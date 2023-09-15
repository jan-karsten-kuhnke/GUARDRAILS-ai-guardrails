from flask_oidc import OpenIDConnect
from flask import request
import logging
oidc = OpenIDConnect()



def get_current_user_id():
    token = request.headers['authorization'].split(' ')[1]
    user_info = oidc._get_token_info(token)
    return user_info['preferred_username']

def get_current_user_groups():
    user_groups = []
    token = request.headers['authorization'].split(' ')[1]
    user_info = oidc._get_token_info(token)
    groups = user_info['groups'] if 'groups' in user_info else []
    for group in groups:
        # if group  is of type string then append it to user_groups, if object, and contains code, append code to user_groups
        if isinstance(group, str):
            user_groups.append(group)
        elif 'code' in group:
            user_groups.append(group['code'])
    logging.debug(f'User groups: {user_groups}')
    return user_groups
        


def get_current_user_roles():
    token = request.headers['authorization'].split(' ')[1]
    user_info = oidc._get_token_info(token)
    return user_info['realm_access']['roles']