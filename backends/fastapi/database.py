import os
from sqlmodel import create_engine, Session

# Use local PostgreSQL container
DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/todo_db"
)

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
