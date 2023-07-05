from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from globals import Globals
from database.models import Base

# Create engine and bind it to the Base
engine = create_engine(Globals.DB_URL)
Base.metadata.bind = engine

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Create a session
Session = sessionmaker(bind=engine)
session = Session()