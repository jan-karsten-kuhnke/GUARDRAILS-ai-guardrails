import os
import json
import logging
from langchain.embeddings import HuggingFaceEmbeddings

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "keys/vertexai.json"
os.environ["TOKENIZERS_PARALLELISM"]="false"



class Globals:
    mongo_uri = os.environ.get("MONGO_URI")
    mongo_db_name = os.environ.get("MONGO_DB_NAME")
    pg_schema = os.environ.get("PG_SCHEMA")
    DB_URL =os.environ.get("DB_URI")
    vector_store_pg_schema = "public"

    VECTOR_STORE_DB_URI=os.environ.get("VECTOR_STORE_DB_URI")
    VECTOR_STORE_COLLECTION_NAME ="documents"
    
    #Flowable
    FLOWABLE_BASE_URL = os.environ.get("FLOWABLE_BASE_URL")
    FLOWABLE_KEY = os.environ.get("FLOWABLE_KEY")
    FlOWABLE_ADMIN_USERNAME = os.environ.get("FLOWABLE_ADMIN_USERNAME")
    
     #Embeddings 

    embeddings = HuggingFaceEmbeddings()
    
    #encryptions
    ENCRYPTION_KEY=os.environ.get("ENCRYPTION_KEY")

    
    # Embeddings db details
    persist_directory = 'db'
    chunk_size = 1000
    chunk_overlap = 50

    # LLM details
    gpt4all_model_path = 'api/models/ggml-gpt4all-j-v1.3-groovy.bin'
    LlamaCpp_model_path = 'api/models/model_llama.bin'
    model_n_ctx = 4096
    model_temp = 0
    model_n_batch = 8

    model_temp = 0

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
    
    open_ai_api_key=os.environ.get("OPENAI_API_KEY")

    project_id = os.environ.get("PROJECT_ID")
    processor_id = os.environ.get("PROCESSOR_ID")
    ocr_processor_id = os.environ.get("OCR_PROCESSOR_ID")

    #FeatureFlaga

    applet_access_request_feature_flag=os.environ.get("APPLET_ACCESS_REQUEST")
    
    logging_level = os.environ.get("LOGGING_LEVEL")

    def prepare_client_secrets():
        if os.path.isfile("client_secrets.json"):
            logging.info("removing existing client_secrets.json")
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
            logging.info('writing new client_secrets.json')
            json.dump(new_client_secrets, outfile)

