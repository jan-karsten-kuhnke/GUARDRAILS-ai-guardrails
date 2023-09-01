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

    
#validate collectin name
def validate_collection_name(collection_name):
    if not collection_name:
        return jsonify(error="Collection name is required."),400
    if type(collection_name) != str:
        return jsonify(error="Collection name should be a string"),400
    collection_name=collection_name.strip()
    if collection_name.isalpha() == False:
        return jsonify(error="Collection name should contain only alphabetic characters"),400
    return True
def validate_document_fields(title,description,location,folder_id):
    if title and type(title) != str:
        return jsonify(error="Invalid data type for title."),400 
    if description and type(description) != str:
        return jsonify(error="Invalid data type for description"),400
    if location and type(location) != str:
        return jsonify(error="Invalid data type for location"),400
    if folder_id and type(folder_id) != int:
        return jsonify(error="Invalid data type for folder_id"),400
    return True