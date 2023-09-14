from flask import Flask, Blueprint, Response, jsonify
from flask_restful import Resource, Api, reqparse, request
from service.acl_service import acl_service
from flask_smorest import Blueprint as SmorestBlueprint
from time import time
import os
from oidc import oidc
from oidc import get_current_user_id
from oidc import get_current_user_groups
from oidc import get_current_user_roles
from utils.util import rename_id
import json
from utils.util import validate_fields
aclendpoints = SmorestBlueprint('acl', __name__)


@aclendpoints.route('<entity_type>/<id>', methods=['POST'])
@oidc.accept_token(require_token=True)
def custom_rules_create(entity_type, id):
    if entity_type is None:
            return jsonify(error="entity_type is required"), 400
    if id is None:
            return jsonify(error="id is required"), 400
    data = request.get_json(silent=True)
    return acl_service.update_acl(entity_type, id, data)
