from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main.core.config import settings

connect_args = (
    {"check_same_thread": False} if "sqllite" in settings.DATABASE_URL else {}
)

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
