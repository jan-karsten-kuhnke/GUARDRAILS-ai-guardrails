from oidc import get_current_user_email
from repo.db import folders_context,prompts_context
from database.models import ChainEntity
from database.postgres import session

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
        chains  = session.query(ChainEntity).all()
        return [chain.to_dict() for chain in chains]
    
    def get_tile_by_code(user_email,code):
        chain  = session.query(ChainEntity).filter(ChainEntity.code == code ).first()
        return chain.to_dict()
        

