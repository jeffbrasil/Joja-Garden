from typing import Generator

from main.db.session import SessionLocal


# Esta aqui é uma dependência da sessão do BD
def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db

    finally:
        db.close()
