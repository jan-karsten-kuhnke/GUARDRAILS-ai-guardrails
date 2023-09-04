import datetime

def rename_id(data):
        if isinstance(data, list):
            for i in range(len(data)):
                data[i] = rename_id(data[i])
        elif isinstance(data, dict):
            if '_id' in data:
                data['id'] = data['_id']
                del data['_id']
        return data

def log(class_name = None, msg_type= None, content=None):
        result =  {
            'Timestamp': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'Class Name': class_name,
            'message': f'{msg_type} {content}'
        }
        return result

def create_filtered_chain(chain_dict, user_groups, previous_requests):
    group_code = chain_dict.get('group_code', '')
    return {
        'code': chain_dict.get('code', ''),
        'displayOrder': int(chain_dict['params']['displayOrder']),
        'has_access': group_code == '' or group_code in user_groups,
        'icon': chain_dict.get('icon', ''),
        'is_active': chain_dict.get('is_active', False),
        'request_submitted': group_code in previous_requests,
        'title': chain_dict.get('title', ''),
        'params': {
            'executor': chain_dict['params'].get('executor', ''),
            'inputs': chain_dict['params'].get('inputs', [])
        }
    }