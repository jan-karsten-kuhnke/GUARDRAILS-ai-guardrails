import datetime
from flask import jsonify
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


def validate_chat_fields(data, required_fields):
    if not data:
        return jsonify(error="Missing or invalid JSON data"), 400
        
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify(error=f"Missing required fields: {', '.join(missing_fields)}"), 400
    
    for field in required_fields:
       if field == 'params':
            print("data field",data[field])
            if not isinstance(data[field], dict):
                 return jsonify(error=f"Invalid data type for {field}"), 400
       elif not (isinstance(data[field], str) or type(data[field]) == type(None)):
            return jsonify(error=f"Invalid data type for {field}"), 400
            
    return False
def validate_userdata_fields(data, required_fields):
    if isinstance(data, list):
        if not data or not isinstance(data, list):
            return jsonify(error="Missing or invalid JSON data or data is not an array of objects"), 400

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
        if not data:
                return jsonify(error="Missing or invalid JSON data"), 400
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify(error=f"Missing required fields: {', '.join(missing_fields)}"), 400
        for field in required_fields:
            if not (isinstance(data[field], str) or type(data[field]) == type(None)):
                return jsonify(error= f"Invalid data type for {field}"), 400
    return False
    
#validate collectin name
def validate_collection_name(collection_name):
    if not collection_name:
        return jsonify(error="Collection name is required."),400
    if type(collection_name) != str:
        return jsonify(error="Collection name should be a string"),400
    return True
def validate_document_fields(required_fields):
    for field in required_fields:
        if field and not isinstance(required_fields[field],str):
            return jsonify(error= f"Invalid data type for {field}"), 400
    return True
