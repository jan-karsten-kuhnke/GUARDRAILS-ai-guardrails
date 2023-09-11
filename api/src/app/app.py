import logging
from dotenv import load_dotenv
load_dotenv(override=False)
from flask import Flask, render_template, make_response, jsonify, request
from flask_restful import Api
from flask_cors import CORS
from controller.chat_controller import endpoints
from controller.admin_controller import adminendpoints
from controller.pii_controller import piiendpoints
from controller.userdata_controller import userdataendpoints
from controller.documents_controller import documentsendpoints
import secrets
from flask_swagger_ui import get_swaggerui_blueprint
from oidc import oidc
from globals import *

Globals.prepare_client_secrets()
app = Flask(__name__)
# sets the root level of the logger 
def configure_logging():
    log_level = os.environ.get("LOGGING_LEVEL", "DEBUG")
    log_level = getattr(logging, log_level.upper(), logging.DEBUG)
    logging.getLogger().setLevel(log_level)


app.config["PROPAGATE_EXCEPTIONS"] = True

logging.info('client_secret', Globals.oidc_client_id)
SWAGGER_URL = '/api/documentation'
API_URL = 'http://127.0.0.1:8080/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Ai-Harness API documentation"
    }
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
app.register_blueprint(endpoints, name="chat", url_prefix="/api/chat")
app.register_blueprint(piiendpoints, name="pii", url_prefix="/api/pii")
app.register_blueprint(userdataendpoints, name="user", url_prefix="/api/user")
app.register_blueprint(adminendpoints, name="admin", url_prefix="/api/admin")
app.register_blueprint(documentsendpoints, name="docs", url_prefix="/api/docs")

@app.route('/swagger.json')
def swagger():
    current_directory = os.path.dirname(os.path.abspath(__file__))

    swagger_json_path = os.path.join(current_directory, 'swagger.json')
    with open(swagger_json_path, 'r') as f:
        return jsonify(json.load(f))

CORS(app)
cors = CORS(app, resource={
    r"/*":{
        "origins":"*",
        "methods":['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        "allow_headers":"*"
    }
},supports_credentials=True, allow_headers='*',expose_headers='*')

app.config.update({
    'SECRET_KEY': secrets.token_hex(16),
    'OIDC_CLIENT_SECRETS': 'client_secrets.json',
    'OIDC_SCOPES': ['openid', 'email', 'profile'], 
    'OIDC_INTROSPECTION_AUTH_METHOD': 'client_secret_post',
    'OIDC_COOKIE_SECURE': False,
    'OIDC_REQUIRE_VERIFIED_EMAIL': False,
    'OIDC_USER_INFO_ENABLED': True,
    'OIDC_RESOURCE_SERVER_ONLY': True,
})

oidc.init_app(app)

def create_app():
    configure_logging()
    logging.info("starting server")
    app.run(host = '0.0.0.0', debug=True,port=8080,threaded=True)
    return app
create_app()