import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
import os
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from main.api.deps import get_db
from main.db.base_class import Base
from main.main import app



DATABASE_URL_TEST = "sqlite:///:memory"
engine = create_engine(
    DATABASE_URL_TEST,
    connect_args={"check_same_thread" :False},
    poolclass=StaticPool,
)


SessionTest = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        try:
            db = SessionTest()
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    # Aqui o yield pausa a execução enquanto o arquivo de testes estiver sendo usado
    with TestClient(app) as c:
        yield c
    # Limpeza de tudo do banco temporário
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
