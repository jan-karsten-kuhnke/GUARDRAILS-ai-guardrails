from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from globals import Globals
from database.models import Base
from database.vector_store.vector_store_model import Vector_Base

# Create engine and bind it to the Base
engine = create_engine(Globals.DB_URL)
Base.metadata.bind = engine

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Create a session
Session = sessionmaker(bind=engine)

vector_store_engine = create_engine(Globals.VECTOR_STORE_DB_URI)

Vector_Base.metadata.bind = vector_store_engine

# Create tables if they don't exist
Vector_Base.metadata.create_all(bind=vector_store_engine)

# Create a session
Vector_Session = sessionmaker(bind=vector_store_engine)