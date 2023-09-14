from flask_smorest import Blueprint as SmorestBlueprint
from service.acl_service import acl_service
from oidc import oidc
from flask import Flask, render_template, request, redirect, url_for
from flask import Blueprint, Response, jsonify, abort
from flask_restful import Resource, Api, reqparse, request

aclendpoints = SmorestBlueprint('acl', __name__)


@aclendpoints.route('/<entity_name>/<id>',methods=['POST'])
@oidc.accept_token(require_token=True)
def update_chain_acl(id,entity_name):
    data = request.json
    return acl_service.update_entity_acl(id, entity_name, data)