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

def validate_fields(data,required_fields):
    if not data:
            return jsonify(error="Missing or invalid JSON data"), 400
    missing_fields = [field for field in required_fields if field not in data]
    # if 'params' in required_fields:
    #     if 'params' in data:
    #         # missing_fields = [field for field in required_fields['params'] if field not in data['params']]
    #         missing_fields.extend([field for field in required_fields if field not in data])
    #     else:
    #         missing_fields.extend('params')
    if missing_fields:
         return jsonify(error=f"Missing required fields: {', '.join(missing_fields)}"), 400
    for field in required_fields:
        if not (isinstance(data[field], str) or type(data[field]) == type(None)):
            return jsonify(error= f"Invalid data type for {field}"), 400
    return False