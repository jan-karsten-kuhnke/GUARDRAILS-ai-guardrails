from oidc import get_current_user_email
from repo.db import folders_context,prompts_context
from database.models import ChainEntity
from database.postgres import session
from oidc import get_current_user_groups
from integration.flowable_wrapper import flowable_wrapper

class userdata_service:
    def get_all_folders(user_email):
        return folders_context.get_folder_data(user_email)
        
        
    
    def upsert_folders(folders,user_email):
        user_folder_data = {
            "user_email": user_email,
            "folders": folders
        }
        folders_context.upsert_folders_by_user_email(user_folder_data,user_email)


    def get_all_prompts(user_email):
        return prompts_context.get_prompts_data(user_email)
        
        
    
    def upsert_prompts(prompts,user_email):
        user_prompts_data = {
            "user_email": user_email,
            "prompts": prompts
        }
        prompts_context.upsert_prompts_by_user_email(user_prompts_data,user_email)



    def get_tiles(user_email):
        user_groups = get_current_user_groups()
        previous_requests = flowable_wrapper.get_submitted_requests_code(user_email)
        print(previous_requests)

        all_chains  = session.query(ChainEntity).all()
        res = []

        for chain in all_chains:
            chain_dict = chain.to_dict()
            group_code = chain_dict['group_code']
            chain_dict['dispalyOrder'] = int(chain.params['displayOrder'])
            if group_code is None or group_code == "":
                chain_dict['has_access'] = True
            elif group_code in user_groups:
                chain_dict['has_access'] = True
            else:
                chain_dict['has_access'] = False
            
            chain_dict['request_submitted'] = True if group_code in previous_requests else False
            res.append(chain_dict)
        res.sort(key=lambda x: x['dispalyOrder'])
        return res


    
    def get_tile_by_code(user_email,code):
        chain  = session.query(ChainEntity).filter(ChainEntity.code == code ).first()
        return chain.to_dict()
    
    def request_tile_by_code(user_email,code,name):
        return flowable_wrapper.submit_request(user_email=user_email, tile_code=code,tile_name=name)
        

