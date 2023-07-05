import os
import json


class Globals:
    mongo_uri = os.environ.get("MONGO_URI")
    mongo_db_name = os.environ.get("MONGO_DB_NAME")
    pg_host = os.environ.get("PG_HOST")
    pg_port = os.environ.get("PG_PORT")
    pg_user = os.environ.get("PG_USER")
    pg_password = os.environ.get("PG_PASSWORD")
    pg_db = os.environ.get("PG_DB")
    pg_schema = os.environ.get("PG_SCHEMA")
    DB_URL =os.environ.get("DB_URI")
    
    
    oidc_client_id = os.environ.get("OIDC_CLIENT_ID")
    oidc_client_secret = os.environ.get("OIDC_CLIENT_SECRET")
    oidc_redirect_uris = os.environ.get("OIDC_REDIRECT_URIS")
    oidc_auth_uri = os.environ.get("OIDC_AUTH_URI")
    oidc_userinfo_uri = os.environ.get("OIDC_USERINFO_URI")
    oidc_token_uri = os.environ.get("OIDC_TOKEN_URI")
    oidc_token_introspection_uri = os.environ.get("OIDC_TOKEN_INTROSPECTION_URI")
    oidc_issuer = os.environ.get("OIDC_ISSUER")
    oidc_scope = os.environ.get("OIDC_SCOPE")

    superset_url= os.environ.get("SUPERSET_URL")
    superset_dashboardid= os.environ.get("SUPERSET_DASHBOARDID")
    superset_admin_username= os.environ.get("SUPERSET_ADMIN_USERNAME")
    superset_admin_password= os.environ.get("SUPERSET_ADMIN_PASSWORD")
    superset_guestuser_firstname= os.environ.get("SUPERSET_GUEST_USER_FIRST_NAME")
    superset_guestuser_lastname= os.environ.get("SUPERSET_GUEST_USER_LAST_NAME")
    superset_guestuser_username= os.environ.get("SUPERSET_GUEST_USER_USERNAME")

    keycloak_url= os.environ.get("KEYCLOAK_URL")
    keycloak_realm=os.environ.get("KEYCLOAK_REALM")
    keycloak_admin_username=os.environ.get("KEYCLOAK_ADMIN_USERNAME")
    keycloak_admin_password=os.environ.get("KEYCLOAK_ADMIN_PASSWORD")
    
    open_ai_api_key=os.environ.get("OPEN_AI_API_KEY")

    document_api_url=os.environ.get("DOCUMENT_API_URL")
    
    def prepare_client_secrets():
        if os.path.isfile("client_secrets.json"):
            print("removing existing client_secrets.json")
            os.remove("client_secrets.json")

        new_client_secrets = {
            "web": {
                "client_id": Globals.oidc_client_id,
                "client_secret": Globals.oidc_client_secret,
                "auth_uri": Globals.oidc_auth_uri,
                "userinfo_uri": Globals.oidc_userinfo_uri,
                "token_uri": Globals.oidc_token_uri,
                "token_introspection_uri": Globals.oidc_token_introspection_uri,
                "issuer": Globals.oidc_issuer,
                "scope": Globals.oidc_scope
            }
        }
        
        with open("client_secrets.json", "w") as outfile:
            print('writing new client_secrets.json')
            json.dump(new_client_secrets, outfile)

