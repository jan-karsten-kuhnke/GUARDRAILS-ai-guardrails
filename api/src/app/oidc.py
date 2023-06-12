from flask_oidc import OpenIDConnect
from flask import request
oidc = OpenIDConnect()



def get_current_user_email():
    token = request.headers['authorization'].split(' ')[1]
    user_info = oidc._get_token_info(token)
    return user_info['email']

def get_current_user_groups():
    token = request.headers['authorization'].split(' ')[1]
    user_info = oidc._get_token_info(token)
    return user_info['groups']
