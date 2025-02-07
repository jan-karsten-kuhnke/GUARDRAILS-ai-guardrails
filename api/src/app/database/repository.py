import json

from sqlalchemy import create_engine, text, func ,or_,and_, select
from sqlalchemy.orm import sessionmaker

from database.models import AclEntity, Base, AnalysisAuditEntity, AnonymizeAuditEntity, ChatLogEntity, DocumentEntity, FolderEntity , PromptEntity , OrganisationEntity,CustomRuleEntity,PredefinedRuleEntity, ChainEntity,  EulaEntity, DataSourceEntity, AclEntity
from database.vector_store.vector_store_model import Vector_Base, CollectionEntity

from globals import Globals
from utils.apiResponse import ApiResponse
from flask import jsonify
from service.ingestion_service import IngestionService
import logging


from database.postgres import engine, vector_store_engine, Session , Vector_Session 

class Persistence:
    
    def insert_analysis_audits(text, user_id, flagged_text, analysed_entity, criticality):
        try:
            session=Session()
            audit = AnalysisAuditEntity(text=text, user_id=user_id, flagged_text=flagged_text, analysed_entity=analysed_entity, criticality=criticality)
            session.add(audit)
            session.commit()
        except Exception as ex:
            logging.error(f"Exception while inserting analysis audit: {ex}")
            session.rollback()
        finally:
            session.close()

    def insert_anonymize_audits(original_text, anonymized_text, flagged_text, user_id, analysed_entity, criticality):
        try:
            session=Session()
            audit = AnonymizeAuditEntity(original_text=original_text, anonymized_text=anonymized_text, flagged_text=flagged_text, user_id=user_id, analysed_entity=analysed_entity, criticality=criticality)
            session.add(audit)
            session.commit()
        except Exception as ex:
            logging.error(f"Exception while inserting anonymize audit: {ex}")
            session.rollback()
        finally:
            session.close()

    def insert_chat_log(user_id, text):
        try:
            session=Session()
            log = ChatLogEntity(user_id=user_id, text=text)
            session.add(log)
            session.commit()
        except Exception as ex:
            logging.error(f"Exception while inserting chat log: {ex}")
            session.rollback()
        finally:
            session.close()
            
            
    def insert_document(title, location, custom_ids, collection_name, description=""):
        try:
            session=Session()
            document = DocumentEntity(
                    title=title,
                    description=description,
                    location=location,
                    custom_ids=custom_ids,
                    collection_name=collection_name
                )
            session.add(document)
            session.commit()
        except Exception as ex:
            logging.error(f"Exception while inserting document: {ex}")
            session.rollback()
        finally:
            session.close()
    
    def insert_documents(files,location):
        try:
            session=Session()
            for file in files:
                doc = DocumentEntity(
                    title=file.filename,
                    description="",
                    location= location + "/" + file.filename,
                    )
                session.add(doc)
                session.commit()
            return jsonify({"message": "success"}), 200
        except Exception as e: 
            session.rollback() 
            logging.error(e)
            return jsonify({"message": "error"}), 500
        finally:
            session.close()

    def insert_data_source(name, connection_string, user_id, schemas=[], tables_to_include=[], custom_schema_description=""):
        try:
            session=Session()
            data_source = DataSourceEntity(
                    name=name,
                    connection_string=connection_string,
                    schemas=schemas,
                    tables_to_include=tables_to_include,
                    custom_schema_description=custom_schema_description
                )
            session.add(data_source)
            session.commit()
            Persistence.update_chain_acl(data_source.id, 'data_source', {'uid':[], 'gid':[], 'rid':[], 'owner':user_id})
            return jsonify({"message": "successfully added data source"}), 200
        except Exception as ex:
            logging.error(f"Exception while adding datasource: {ex}")
            session.rollback()
            return jsonify({"message": "error in adding data source"}), 500
        finally:
            session.close()

        

    
    def get_chat_log():
        try:
            session = Session()
            logs = session.query(ChatLogEntity).all()
            result = []
            for log in logs:
                result.append({
                    'id': str   (log.id),
                    'created_at': log.created_at.isoformat(),
                    'user_id': log.user_id,
                    'text': log.text
                })
            return json.dumps(result)
        except Exception as ex:
            logging.error(f"Exception while getting chat logs: {ex}")
        finally:
            session.close()

    def get_org(name):
        try:
            session = Session()
            org = session.query(OrganisationEntity).filter(OrganisationEntity.name == name).first()
            if org:
                return {
                    'id': str(org.id),
                    'name': org.name,
                    'email': org.email,
                    'details': org.details,
                    'openai_key': org.openai_key,
                    'created_at': org.created_at.isoformat()
                }
            else:
                return None
        except Exception as ex:
            logging.error(f"Exception while getting organisation: {ex}")
        finally:
            session.close()

    def save_org(data):
        try:
            session = Session()
            org = OrganisationEntity(name=data['name'], email=data['email'], details=data['details'], openai_key=data['openai_key'])
            session.add(org)
            session.commit()
        except Exception as ex:
            logging.error(f"Exception while inserting organisation: {ex}")
            session.rollback()
        finally:
            session.close()

    def get_list_query(Entity, sort, range_, filter_, collection=None):
        try:
            session = Session()
            query = session.query(Entity)
            if(collection):
                query = query.filter(Entity.collection_name == eval(collection))

            # Apply filter conditions
            filter_dict = eval(filter_)
            if len(filter_dict) != 0:
                filter_field = filter_dict['filterField']
                filter_operator = filter_dict['filterOperator']
                filter_value = filter_dict['filterValue']
                
                if filter_operator == 'contains':
                    query = query.filter(func.lower(getattr(Entity, filter_field)).like(func.lower(f"%{filter_value}%")))
                elif filter_operator == 'equals':
                    query = query.filter(func.lower(getattr(Entity, filter_field)) == func.lower(filter_value))
                elif filter_operator == 'startsWith':
                    query = query.filter(func.lower(getattr(Entity, filter_field)).like(func.lower(f"{filter_value}%")))
                elif filter_operator == 'endsWith':
                    query = query.filter(func.lower(getattr(Entity, filter_field)).like(func.lower(f"%{filter_value}")))
                elif filter_operator == 'isEmpty':
                    query = query.filter(or_(getattr(Entity, filter_field) == None,
                         getattr(Entity, filter_field) == ''))
                elif filter_operator == 'isNotEmpty':
                    query = query.filter(and_(getattr(Entity, filter_field) != None,
                         getattr(Entity, filter_field) != ''))
                elif filter_operator == 'isAnyOf':
                    if len(filter_value) > 0:
                        query = query.filter(func.lower(getattr(Entity, filter_field)).in_(filter_value))
                    
            #total rows count
            total_rows = query.count()

            # Apply sort conditions
            if sort:
                sort_list = eval(sort)
                sort_field_name = sort_list[0]
                sort_value=sort_list[1]
                column = getattr(Entity, sort_field_name)
                if sort_value == 'asc':
                    query = query.order_by(column.asc())
                elif sort_value == 'desc':
                    query = query.order_by(column.desc())

            # Apply range conditions
            if range_:
                range_list = eval(range_)
                start = range_list[0]
                end = range_list[1]
                query = query.slice(start, end + 1)

            # Execute the query and retrieve documents
            documents = query.all()
            
            serialized_documents = [doc.to_dict() for doc in documents]
          
            data = {
                "rows": serialized_documents,
                "totalRows": total_rows
            }
            
            return jsonify({"data":data,"success":True,"message":"Successfully retrieved data"})
        except Exception as ex:
            logging.error(f"Exception while getting list: {ex}")
            return jsonify({"data":{},"success":False,"message": "Error in retrieving data"}), 500
        finally:
            session.close()
    
    def get_one_query(Entity, id):     
        try:
            session = Session()
            document = session.query(Entity).filter(Entity.id == id).first()
            
            if not document:
                return jsonify({"data":{},"success":False,"message": "Cannot find the data"}), 500

            return jsonify({"data":document.to_dict(),"success":True,"message":"Successfully retrieved data"})
            
        except Exception as ex:
            logging.error(f"Exception while getting one item: {ex}")
            return jsonify({"data":{},"success":False,"message": "Error in retrieving data"}), 500
        finally:
            session.close()

     #Get rules name from provider
    def get_all_enabled_entities(Entity, provider_name):
        enabled_entities = []
        
        try:
            session = Session()
            enabled_entities = session.query(Entity).filter(and_(Entity.provider == provider_name,Entity.is_active==True)).all()
            if not enabled_entities:
                enabled_entities = []
            return enabled_entities
        except Exception as ex:
            logging.error(f"Exception while getting enabled entities: {ex}")
            return []
        finally:
            session.close()

    def update_query(Entity, id, data):
        try:            
            session=Session()
            predefined_rule = session.query(Entity).filter(Entity.id == id).first()
            predefined_rule.is_active = data['is_active']
            session.commit()
            return jsonify({"success":True,"message":"Successfully updated predefined rules"})
        except Exception as ex:
            session.rollback()
            logging.error(f"Exception while updating predefined rules: {ex}")
            return jsonify({"success":False,"message": "Error in updating predefined rules"}), 500
        finally:
            session.close()

    def update_document(document_id, title, description, location, collection_name):
        try:
            session=Session()
            document = session.query(DocumentEntity).filter(DocumentEntity.id == document_id).first()
            if not document:
                return jsonify({"message": "not found"}), 404
            if title:
                document.title = title
            if description:
                document.description = description
            if location:
                document.location = location
            if collection_name:
                document.collection_name = collection_name
            session.commit()
            return jsonify({"message": "success", "document": document.to_dict()}), 200
        except Exception as e:
            session.rollback()
            return jsonify({"message": "error"}), 500
        finally:
            session.close()

    def update_data_source(id, name, connection_string, schemas, tables_to_include, custom_schema_description):
        try:
            session=Session()
            data_source = session.query(DataSourceEntity).filter(DataSourceEntity.id == id).first()
            if not data_source:
                return jsonify({"message": "not found"}), 404
            if name is not None:
                data_source.name = name
            if connection_string is not None:
                data_source.connection_string = connection_string
            if schemas is not None:
                data_source.schemas = schemas
            if tables_to_include is not None:
                data_source.tables_to_include = tables_to_include
            if custom_schema_description is not None:
                data_source.custom_schema_description = custom_schema_description
            session.commit()
            return jsonify({"message": "successfully updated data source", "data_source": data_source.to_dict()}), 200
        except Exception as e:
            session.rollback()
            return jsonify({"message": "error in updating data source"}), 500
        finally:
            session.close()
    
    def get_document_by_id(id):
        try:
            session=Session()
            document = session.query(DocumentEntity).filter(DocumentEntity.id == id).first()
            res = document.to_dict()
            return res
        except Exception as ex:
            logging.error(f"Exception while getting document: {ex}")
        finally:
            session.close()
    
    def delete_document(document_id):
        try:
            session=Session()
            connection = vector_store_engine.connect()
            document = session.query(DocumentEntity).filter(DocumentEntity.id == document_id).first()
            if document is None:
                return jsonify({"message": "document not found"}), 404
            row = document.to_dict()

            #deleting vector store embeddings for  document
            custom_ids = row['custom_ids']
            comma_separated_custom_ids = ', '.join([f"'{id}'" for id in custom_ids])
            sql_query = f"DELETE FROM langchain_pg_embedding WHERE custom_id IN ({comma_separated_custom_ids})"
            result = connection.execute(text(sql_query))
            connection.commit()

            
            session.delete(document)
            session.commit()
            return jsonify({"message": "success"}), 200
        except Exception as ex:
            logging.error(f"Exception while deleting document: {ex}")
            session.rollback()
            return jsonify({"message": "error"}), 500
        finally:
            connection.close()
            session.close()
            
    def get_pgvector_document_by_id(document_id):
        try:
            document = Persistence.get_document_by_id(document_id)

            custom_ids = document['custom_ids']
            comma_separated_custom_ids = ', '.join([f"'{id}'" for id in custom_ids])
            
            connection = vector_store_engine.connect()
            sql_query = f"SELECT document FROM langchain_pg_embedding WHERE custom_id IN ({comma_separated_custom_ids})"
            result = connection.execute(text(sql_query)) 
            
            rows = []
            
            for r in result:
                rows.append(r[0])
            return {"docs":rows,"metadata":document}
        except Exception as ex:
            logging.error(f"Exception while getting document: {ex}")
        finally:
            connection.close()
    
    def get_chain_by_code(chain_code):
        try:
            session=Session()
            chain = session.query(ChainEntity).filter(ChainEntity.code == chain_code).first()
            serialized_chain = chain.to_dict()
            return serialized_chain
        except Exception as ex:
            logging.error(f"Exception while getting chain params: {ex}")
        finally:
            session.close()

    def get_data_source_by_id(id):
        try:
            session=Session()
            data_source = session.query(DataSourceEntity).filter(DataSourceEntity.id == id).first()
            serialized_data_source = data_source.to_dict()
            return serialized_data_source
        except Exception as ex:
            logging.error(f"Exception while getting data source: {ex}")
        finally:
            session.close()
        
    def get_all_data_source(userName, userGroups, userRoles):
        try:
            session=Session()
            subquery = Persistence.acl_subquery(userName, userGroups, userRoles, 'data_source', session)
            main_query = (
                session.query(DataSourceEntity)
                .filter(DataSourceEntity.id.in_(subquery))
            )
            results = main_query.all()
            res = []
            for r in results:
                res.append(DataSourceEntity.to_dict(r))
            return res
        except Exception as ex:
            logging.error(f"Exception while getting data source: {ex}")
        finally:
            session.close()

    def acl_subquery(userName, userGroups, userRoles, entity_name, session):
        try:
            subquery = (
                session.query(AclEntity.entity_id)
                .filter(AclEntity.entity_type == entity_name)
                .filter(
                    AclEntity.gid.overlap(userGroups) |
                    AclEntity.rid.overlap(userRoles) |
                    AclEntity.uid.overlap([userName]) |
                    (AclEntity.owner == userName)
                )
            )
            return subquery
        except Exception as ex:
            logging.error(f"Exception while getting acl subquery: {ex}")
            # session.close()
            
    def get_all_tiles(userName, userGroups, userRoles):
        try:
            session=Session()
            subquery = Persistence.acl_subquery(userName, userGroups, userRoles, 'chain', session)
            main_query = (
                session.query(ChainEntity)
                .filter(ChainEntity.id.in_(subquery))
            )
            results = main_query.all()
            return results
        except Exception as ex:
            logging.error(f"Exception while getting tiles: {ex}")
        finally:
            session.close()

    def get_folder_data(user_id):
        try:
            session=Session()
            folders = session.query(FolderEntity).filter(FolderEntity.user_id == user_id).first()
            serialized_folders={}
            if folders:
                serialized_folders = folders.to_dict()
            return serialized_folders
        except Exception as ex:
            logging.error(f"Exception while getting folders: {ex}")
        finally:
            session.close()
    
    def upsert_folders_by_user_email(folders,user_id):
        try:
            session=Session()
            folders_data= session.query(FolderEntity).filter(FolderEntity.user_id == user_id).first()
            if folders_data:
                folders_data.folders = folders
            else:
                folders_data = FolderEntity(user_id=user_id,folders=folders)
                session.add(folders_data)
            session.commit()
        except Exception as ex:
            session.rollback()
            logging.error(f"Exception while upserting folders: {ex}")
        finally:
            session.close()
            
    def get_prompts_data(user_id):
        try:
            session=Session()
            prompts = session.query(PromptEntity).filter(PromptEntity.user_id == user_id).first()
            serialized_prompts={}
            if prompts:
                serialized_prompts = prompts.to_dict()
            return serialized_prompts
        except Exception as ex:
            logging.error(f"Exception while getting prompts: {ex}")
        finally:
            session.close()

    def upsert_prompts_by_user_email(prompts,user_id):
        try:
            session=Session()
            prompts_data= session.query(PromptEntity).filter(PromptEntity.user_id == user_id).first()
            if prompts_data:
                prompts_data.prompts = prompts
            else:
                prompts_data = PromptEntity(user_id=user_id,prompts=prompts)
                session.add(prompts_data)
            session.commit()
        except Exception as ex:
            session.rollback()
            logging.error(f"Exception while upserting prompts: {ex}")  
        finally:
            session.close()    


    def add_collection(collection_name):
        try:
            vector_session=Vector_Session()
            collection = vector_session.query(CollectionEntity).filter(CollectionEntity.name == collection_name).first()
            if collection:
                return jsonify({"message": "collection already exists","success":False}), 500  
            else:
                data = CollectionEntity(name=collection_name)
                vector_session.add(data)
                vector_session.commit()
                return jsonify({"message": "collection successfully added","success":True}), 200
        except Exception as ex:
            vector_session.rollback()
            logging.error(f"Exception while upserting prompts: {ex}")
            return jsonify({"message": "failed","success":False}), 500  
        finally:
            vector_session.close()

    def get_collections():
        try:
            vector_session=Vector_Session()
            collections = vector_session.query(CollectionEntity).all()
            result = []
            for collection in collections:                    
                result.append({
                    'id': str(collection.uuid),
                    'name': collection.name
                })
            return jsonify({"data":result,"success":True}),200
        except Exception as ex:
            logging.error(f"Exception while getting chat logs: {ex}")
        finally:
            vector_session.close()   
            
    def get_documents_by_collection_name(collection_name):
        try:
            session=Session()
            documents = session.query(DocumentEntity).filter(DocumentEntity.collection_name == collection_name).all()
            result = []
            for document in documents:
                result.append({
                    'id': str(document.id),
                    'title': document.title,
                })
            return jsonify({"data":result,"success":True}),200
        except Exception as ex:
            return jsonify({"data":"","success":False,"message": "Error in retrieving documents from collection"}), 500
            logging.error(f"Exception while getting documents: {ex}")
        finally:
            session.close()         
        
    def get_eula_status(user_id):
        try:
            session=Session()
            eula = session.query(EulaEntity).filter(EulaEntity.user_id == user_id).first()
            
            eula_status=False
            if eula:
                serialized_eula=eula.to_dict()
                eula_status = serialized_eula['eula']
                
            return jsonify({"data":{"eula":eula_status},"success":True,"message": "Successfully retrieved eula"}), 200      
        except Exception as ex:
            return jsonify({"data":"","success":False,"message": "Error in retrieving eula"}), 500      
            logging.error(f"Exception while getting eula status: {ex}")
        finally:
            session.close()
            
    def set_eula_status(user_id):
        try:
            session=Session()
            eula = session.query(EulaEntity).filter(EulaEntity.user_id == user_id).first()
            if eula:
                eula.eula = True
            else:
                eula = EulaEntity(user_id=user_id,eula=True)
                session.add(eula)
            session.commit()
            return jsonify({"message": "Successfully updated eula","success":True}), 200
        except Exception as ex:
            logging.error(f"Exception while setting eula status: {ex}")
            session.rollback()
            return jsonify({"message": "Error in updating eula","success":False}), 500
        finally:
            session.close()

    

    def insert_chain(title, icon, code, params, active, group_code, user_id):
        try:
            session=Session()
            chain = ChainEntity(
                    title=title,
                    icon=icon,
                    code=code,
                    params=params,
                    is_active=active,
                    group_code=group_code
            )
            session.add(chain)
            session.commit()
            #create an entry in acl table for chain
            Persistence.update_chain_acl(chain.id, 'chain', {'uid':[], 'gid':[], 'rid':[], 'owner':user_id})
            return jsonify({"message": "Successfully inserted chain","success":True}), 200
        except Exception as e:
            logging.error(f"Exception while inserting chain: {e}")
            session.rollback()
            return jsonify({"message": "Error in inserting chain","success":False}), 500
        finally:
            session.close()
    
    def update_chain(id, data):
        try:
            session=Session()
            chain=session.query(ChainEntity).filter(ChainEntity.id == id).first()
            if chain:
                if 'title' in data:
                    chain.title = data['title']
                if 'icon' in data:
                    chain.icon = data['icon']
                if 'code' in data:
                    chain.code = data['code']
                if 'params' in data:
                    chain.params = data['params']
                if 'is_active' in data:
                    chain.is_active = data['is_active']
                if 'group_code' in data:
                    chain.group_code = data['group_code']
            else:
                return jsonify({"message": "Cannot find the chain","success":False}), 500
            session.commit()
            return jsonify({"message": "Successfully updated chain","success":True}), 200
        except Exception as e:
            logging.error(f"Exception while updating chain: {e}")
            session.rollback()
            return jsonify({"message": "Error in updating chain","success":False}), 500
        finally:
            session.close()
        
    
    def update_acl_list(id,entity_type, data):
        try:
            session=Session()
            acl  = session.query(AclEntity).filter(AclEntity.entity_id == id, AclEntity.entity_type==entity_type ).first()
            if acl is None:
                #create an entry in acl table
                acl = AclEntity(entity_id=id, entity_type=entity_type, uid=[], gid=[], rid=[], owner=data['owner'])
                session.add(acl)
                session.commit()
                return
            acl_list = acl.to_dict()

            keysList = [key for key in data.keys()]
            for key in keysList:
                array = data[key] 
                if isinstance(array, list) :
                    if data['is_provide_access']:
                        acl_list[key].extend(array)
                    else:
                        for item in array:
                            if item in acl_list[key]:
                                acl_list[key].remove(item)
                elif isinstance(array, str):
                    if data['is_provide_access']:
                        acl_list[key] = array
                    else:
                        acl_list[key] = ""

            session.query(AclEntity).filter(AclEntity.entity_id == id, AclEntity.entity_type==entity_type ).update(acl_list)
            session.commit()
            return jsonify({"message": "Successfully updated {} acl".format(entity_type), "success": True}), 200
        except Exception as e:
            logging.error(f"Exception while updating acl: {e}")
            session.rollback()
            return jsonify({"message": "Error in updating acl","success":False}), 500
        finally:
            session.close()
 
