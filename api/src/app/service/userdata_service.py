from oidc import get_current_user_id
from database.models import ChainEntity
from database.postgres import Session, engine
from oidc import get_current_user_groups, get_current_user_roles
from integration.flowable_wrapper import flowable_wrapper
from database.repository import Persistence
from globals import Globals
from utils.util import required_chain_fields
import logging
import json
from globals import Globals
from sqlalchemy import cast, create_engine, text, select
from integration.keycloak_wrapper import keycloak_wrapper

class userdata_service:
    def get_all_folders(user_id):
        return Persistence.get_folder_data(user_id)
        
    def upsert_folders(folders,user_id):
        Persistence.upsert_folders_by_user_email(folders,user_id)


    def get_all_prompts(user_id):
        return Persistence.get_prompts_data(user_id)
    
    def upsert_prompts(prompts,user_id):
        Persistence.upsert_prompts_by_user_email(prompts,user_id)



    def get_tiles(user_id):
        try:
            user_groups = get_current_user_groups()
            user_roles = get_current_user_roles()
            session=Session()
            all_chains  = session.query(ChainEntity).all()
            assigned_chains = Persistence.get_all_tiles(user_id, user_groups, user_roles)

            assigned_chain_codes = []
            previous_requests = []
            if(Globals.applet_access_request_feature_flag == "Enabled"):
                previous_requests = flowable_wrapper.get_submitted_requests_code(user_id)
                
            res = []
            for assigned_chain in assigned_chains:
                 chain_dict = ChainEntity.to_dict(assigned_chain)
                 assigned_chain_codes.append(chain_dict['code'])

            for chain in all_chains:
                chain_dict = chain.to_dict()
                filtered_chain = required_chain_fields(chain_dict, user_groups, previous_requests)
                if chain_dict['code'] in assigned_chain_codes :
                   filtered_chain['has_access'] = True
                else:
                   filtered_chain['has_access'] = False
                res.append(filtered_chain)
            res.sort(key=lambda x: x['displayOrder'])
            return res
        
        except Exception as ex:
            logging.error(f"Exception getting all tiles: {ex}")
            return {"data":{},"success":False,"message":"Error in retrieving the data"}
        finally:
            session.close()


    
    def get_tile_by_code(user_id,code):
        try:
            session=Session()
            chain  = session.query(ChainEntity).filter(ChainEntity.code == code ).first()
            return chain.to_dict()
        except Exception as ex:
            logging.error(f"Exception getting tile by code: {ex}")
            return {"data":{},"success":False,"message":"Error in retrieving the data"}
        finally:
            session.close()
    
    def request_tile_by_code(user_id,code,name):
        return flowable_wrapper.submit_request(user_id=user_id, tile_code=code,tile_name=name)
        
    def get_eula_status(user_id):
        return Persistence.get_eula_status(user_id)

    def set_eula_status(user_id):
        return Persistence.set_eula_status(user_id)
    
    def search_users(name):
        all_users= keycloak_wrapper.search_users(name)
        current_user_id = get_current_user_id()
        users = list(filter(lambda x: x['email'] != current_user_id, all_users))
        return users
    
    def get_user_groups():
        return get_current_user_groups()