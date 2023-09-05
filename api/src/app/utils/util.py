import datetime
from flask import jsonify

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

def required_chain_fields(chain_dict, user_groups, previous_requests):
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

def validate_fields(data, required_fields = None):
    if not data:
        return jsonify(error="Missing or invalid JSON data"), 400
    
    if isinstance(data, list):

        errors = []
        for index, item in enumerate(data):
            missing_fields = [field for field in required_fields if field not in item]
            if missing_fields:
                errors.append({"index": index, "error": f"Missing required fields: {', '.join(missing_fields)}"})
            
        if errors:
            return jsonify(errors=errors), 400
        
        for index, data in enumerate(data):
            for field in required_fields:
                if field in data and not isinstance(data[field], str):
                    return jsonify(error={"index": index, "error": f"Invalid data type for {field}"}), 400

    else:
        # if fields are optional, check the types only
        if not required_fields:
            for field in data:
                if not isinstance(data[field], str):
                    return jsonify(error=f"Invalid data type for {field}"), 400
        else:
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                return jsonify(error=f"Missing required fields: {', '.join(missing_fields)}"), 400
            nulls_allowed = ['folderId']
            for field in required_fields:
                if field == 'params':
                    if not isinstance(data[field], dict):
                        return jsonify(error=f"Invalid data type for {field}"), 400
                elif not (isinstance(data[field], str) or (field in nulls_allowed and type(data[field]) == type(None))):
                    return jsonify(error=f"Invalid data type for {field}"), 400
    return False
    
