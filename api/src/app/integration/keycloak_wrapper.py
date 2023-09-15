import requests
from globals import *

keycloak_url = Globals.keycloak_url
keycloak_realm = Globals.keycloak_realm
keycloak_admin_username=Globals.keycloak_admin_username
keycloak_admin_password=Globals.keycloak_admin_password
base_url = keycloak_url + "/admin/realms/" + keycloak_realm

class keycloak_wrapper:
    
    def _get_access_token():
        url = f"{keycloak_url}/realms/master/protocol/openid-connect/token"
        payload = 'grant_type=password&client_id=admin-cli&username=' + keycloak_admin_username + '&password=' + keycloak_admin_password
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        response = requests.request("POST", url, headers=headers, data=payload)
        token = json.loads(response.text)
        return token["access_token"]

    #search users by name
    def search_users(name):
        url = base_url + "/users?search=" + name
        token = keycloak_wrapper._get_access_token()
        response = requests.request("GET", url, headers={"Authorization": "Bearer " + token})
        if (response.status_code == 200):
            return json.loads(response.text)
        return []
    
    def get_users_by_role(role_name):
        url = base_url + "/roles/" + role_name + "/users"
        token = keycloak_wrapper._get_access_token()
        response = requests.request("GET", url, headers={"Authorization": "Bearer " + token})
        if (response.status_code == 200):
            return json.loads(response.text)
        return []
           
    def get_users_by_group(group_name):
        token = keycloak_wrapper._get_access_token()
        group_id = keycloak_wrapper._get_id_by_group_name(group_name, token)
        if (group_id is not None):
            url = base_url + "/groups/" + group_id + "/members"
            response = requests.request("GET", url, headers={"Authorization": "Bearer " + token})
            if (response.status_code == 200):
                return json.loads(response.text)
        return []
    
    def get_users_by_role_and_group(role_name, group_name):
        users_by_role = keycloak_wrapper.get_users_by_role(role_name)
        users_by_group = keycloak_wrapper.get_users_by_group(group_name)
        common_users = list(filter(lambda x: x in users_by_role, users_by_group))
        return common_users
        

    def _get_id_by_group_name(group_name, token):
        url = base_url + "/groups"
        all_groups = requests.request("GET", url, headers={"Authorization": "Bearer " + token})
        groups_arr = json.loads(all_groups.text)
        for group in groups_arr:
            if (group_name == group['name']):
                return group['id']
        return None
        
        