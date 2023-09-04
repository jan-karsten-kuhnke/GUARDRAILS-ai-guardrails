from oidc import get_current_user_email
from database.models import ChainEntity
from database.postgres import Session
from oidc import get_current_user_groups
from integration.flowable_wrapper import flowable_wrapper
from database.repository import Persistence
from globals import Globals
from utils.util import create_filtered_chain

class userdata_service:
    def get_all_folders(user_email):
        return Persistence.get_folder_data(user_email)
        
    def upsert_folders(folders,user_email):
        Persistence.upsert_folders_by_user_email(folders,user_email)


    def get_all_prompts(user_email):
        return Persistence.get_prompts_data(user_email)
    
    def upsert_prompts(prompts,user_email):
        Persistence.upsert_prompts_by_user_email(prompts,user_email)



    def get_tiles(user_email):
        try:
            user_groups = get_current_user_groups()
            session=Session()
            all_chains  = session.query(ChainEntity).all()
            previous_requests = []
            if(Globals.applet_access_request_feature_flag == "Enabled"):
                previous_requests = flowable_wrapper.get_submitted_requests_code(user_email)
                
            res = []

            for chain in all_chains:
                chain_dict = chain.to_dict()
                print(chain_dict,"chain_dict")
                filtered_chain = create_filtered_chain(chain_dict, user_groups, previous_requests)
                res.append(filtered_chain)
            res.sort(key=lambda x: x['displayOrder'])
            return res
        
        except Exception as ex:
            logging.error(f"Exception getting all tiles: {ex}")
            return {"data":{},"success":False,"message":"Error in retrieving the data"}
        finally:
            session.close()


    
    def get_tile_by_code(user_email,code):
        try:
            session=Session()
            chain  = session.query(ChainEntity).filter(ChainEntity.code == code ).first()
            return chain.to_dict()
        except Exception as ex:
            logging.error(f"Exception getting tile by code: {ex}")
            return {"data":{},"success":False,"message":"Error in retrieving the data"}
        finally:
            session.close()
    
    def request_tile_by_code(user_email,code,name):
        return flowable_wrapper.submit_request(user_email=user_email, tile_code=code,tile_name=name)
        
    def get_eula_status(user_email):
        return Persistence.get_eula_status(user_email)

    def set_eula_status(user_email):
        return Persistence.set_eula_status(user_email)
