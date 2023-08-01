from database.postgres import session 
from database.models import ChainEntity

class ParamsProvider:
    def get_params(chain_code):
        try:
            params = session.query(ChainEntity).filter(ChainEntity.code == chain_code).all()
            serialized_params = [p.to_dict() for p in params]
            return serialized_params[0]['params']
        except Exception as ex:
            logging.error(f"Exception while getting chain params: {ex}")
        finally:
            session.close()

        
