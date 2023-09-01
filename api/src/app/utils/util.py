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


def validate_chat_fields(data, required_fields, required_params_fields=[]):
    if not data:
        return jsonify(error="Missing or invalid JSON data"), 400
    
    if data['task'] == 'qa-retrieval':
        required_params_fields.append('qaDocumentId')
    elif data['task'] == 'summarize-brief':
         required_params_fields.append('documentId')
        
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify(error=f"Missing required fields: {', '.join(missing_fields)}"), 400
    
    for field in required_fields:
        # validate params field {}
        if field == 'params' and 'params' in data:
            params = data['params']
            if not isinstance(params, dict):
                return jsonify(error="Invalid data type for params"), 400
                
            missing_params_fields = [param_field for param_field in required_params_fields if param_field not in params]
            if missing_params_fields:
                return jsonify(error=f"Missing required params fields: {', '.join(missing_params_fields)}"), 400
            for param in required_params_fields:
                if param is not 'documentId' and not isinstance(params[param], str):
                    return jsonify(error=f"Invalid data type for {param}"), 400
                elif param is 'documentId' and not isinstance(params[param], int):
                    return jsonify(error=f"Invalid data type for {param}"), 400
                
        elif not (isinstance(data[field], str) or data[field] is None):
            return jsonify(error=f"Invalid data type for {field}"), 400
            
    return False
