import requests
import json
from globals import Globals



class flowable_wrapper:

    def get_process_id():
        url = f"{Globals.FLOWABLE_BASE_URL}/repository/process-definitions?latest=true"

        payload = ""
        headers = {
        'Authorization': f'Basic {Globals.FLOWABLE_KEY}'
        }

        response = requests.request("GET", url, headers=headers, data=payload)

        response = response.json()

        data = response['data']

        for i in data:
            if i['key'] == 'AccessForTiles':
                return str(i['id'])
    

    def submit_request(user_email, tile_code, tile_name):
        url = f"{Globals.FLOWABLE_BASE_URL}/runtime/process-instances"

        payload = json.dumps({
        "processDefinitionId": flowable_wrapper.get_process_id(),
        "returnVariables": True,
        "variables": [
            {
            "name": "owner",
            "value": user_email
            },
            {
            "name": "assignee",
            "value": Globals.FlOWABLE_ADMIN_USERNAME
            },
            {
            "name": "tile",
            "value": tile_code
            },
            {
            "name": "tile_name",
            "value": tile_name
            }
        ]
        })
        headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {Globals.FLOWABLE_KEY}'
        }

        response = requests.request("POST", url, headers=headers, data=payload)

        return response.json()

    def get_submitted_requests_code(user_email):
        url = f"{Globals.FLOWABLE_BASE_URL}/query/historic-process-instances"

        payload = json.dumps({
        "processDefinitionId": flowable_wrapper.get_process_id(),
        "includeProcessVariables": True,
        "variables": [
            {
            "name": "owner",
            "value": user_email,
            "operation": "equals",
            "type": "string"
            }
        ]
        })
        headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {Globals.FLOWABLE_KEY}'
        }

        response = requests.request("POST", url, headers=headers, data=payload)
        
        data  = response.json()['data']
        all_codes = []
        for d in data:
            variables = d['variables']
            for v in variables:
                if v['name'] == 'workgroup' or v['name'] == 'tile':
                    all_codes.append(v['value'])


        return all_codes
    
    def get_requests_for_admin(user_email = Globals.FlOWABLE_ADMIN_USERNAME):
        url = f"{Globals.FLOWABLE_BASE_URL}/query/historic-task-instances?size=1000"

        payload = json.dumps({
        "taskAssignee": user_email,
        "processDefinitionId": flowable_wrapper.get_process_id(),
        "includeProcessVariables": True,
        "processVariables": []
        })
        headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {Globals.FLOWABLE_KEY}'
        }

        response = requests.request("POST", url, headers=headers, data=payload)
        data = response.json()['data']
        result = []
        for d in data:
            id = d['id']
            status = ""
            submitted_by = ""
            tile = ""
            variables = d['variables']
            for v in variables:
                if v['name'] == 'workgroup' or v['name'] == 'tile':
                    tile = v['value']
                if v['name'] == 'owner':
                    submitted_by = v['value']
                if v['name'] == 'status':
                    status = v['value']
            result.append({
                "id":id,
                "status":status,
                "submitted_by":submitted_by,
                "tile":tile
            })
                
        return result
    

    def complete_request(request_id, approved:bool):
        url = f"{Globals.FLOWABLE_BASE_URL}/runtime/tasks/{request_id}"

        payload = json.dumps({
        "action": "complete",
        "variables": [
            {
            "name": "approved",
            "value": approved
            }
        ]
        })
        headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {Globals.FLOWABLE_KEY}'
        }

        response = requests.request("POST", url, headers=headers, data=payload)
        return response.status_code == 200






                
                

