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

DATABASE_URL_TEST = "sqlite:///:memory:"
engine = create_engine(
    DATABASE_URL_TEST,
    connect_args={"check_same_thread" :False},
    poolclass=StaticPool,
)

SessionTest = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Cria as tabelas, entrega uma sessão para o teste e 
    limpa tudo quando finalizar"""

    Base.metadata.create_all(bind=engine)

    try:
        session = SessionTest()
        yield session
    finally:
        session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    # Aqui o yield pausa a execução enquanto o arquivo de testes estiver sendo usado
    with TestClient(app) as c:
        yield c
    # Limpeza de tudo do banco temporário
    app.dependency_overrides.clear()

@pytest.fixture
def admin_payload():
    return {
        "nome": "Admin Teste",
        "cpf": "08601441009",
        "senha": "Gri90p2M@8(Y",
    }

@pytest.fixture
def usuario_payload():
    return {
        "nome": "Cliente Feliz",
        "cpf": "13765913081",
        "email": "cliente@email.com",
        "senha": "Senha_cliente1",
        "endereco" : "rua 1" 
}

@pytest.fixture
def planta_catalogo_payload():
    return {
        "nome": "Samambaia Americana",
        "nome_cientifico": "Nephrolepis exaltata",
        "categoria" : "Polypodiales",
        "familia" : "Nephrolepidaceae",
        "descricao": "Gosta de sombra e umidade.",
        "instrucoes_cuidado": "Sombra parcial",
        "img_url" : "finge que tem um link aqui",
        "periodicidade_rega": "2",
        "periodicidade_poda": "30",
        "periodicidade_adubo": "15"
        
    }

@pytest.fixture
def get_admin_header(client:TestClient, admin_payload):

    client.post("admin/criar_conta", json = admin_payload)

    login = {"username" : admin_payload["cpf"], "password" : admin_payload["senha"]}
    response = client.post("/auth/token", data = login)
    assert response.status_code == 200, f"Login falhou: {response.json()}"
    token = response.json()["access_token"]
    return {"Authorization" : f"Bearer {token}"}

@pytest.fixture
def get_usuario_header(client:TestClient, usuario_payload, get_admin_header):

    client.post("usuario", headers =get_admin_header, json = usuario_payload)
    login = {"username" : usuario_payload["cpf"], "password" : usuario_payload["senha"]}
    response = client.post("/auth/token", data = login)
    token = response.json()["access_token"]
    
    return  {"Authorization" : f"Bearer {token}"}











@pytest.fixture
def get_usuario_header_com_id(client:TestClient, usuario_payload, get_admin_header):

    res = client.post("usuario", headers =get_admin_header, json = usuario_payload)
    login = {"username" : usuario_payload["cpf"], "password" : usuario_payload["senha"]}
    response = client.post("/auth/token", data = login)
    token = response.json()["access_token"]
    
    return  {"Authorization" : f"Bearer {token}", "id":res.json()["id"] }


def get_usuario_com_jardim(client, get_admin_header, usuario_payload, get_usuario_header):

    header_user = get_usuario_header

    jardim_payload = {"nome": "Jardim de Teste"}

    resp_jardim = client.post(
        "/jardins/",
        json=jardim_payload,
        headers=header_user
    )

    assert resp_jardim.status_code == 201

    return {
        "header_user": header_user,
        "jardim": resp_jardim.json()
    }





@pytest.fixture
def planta_catalogo(client: TestClient, get_admin_header):
    planta_payload ={
  "nome": "espada-sao-jorge",
  "nome_cientifico": "nomeciencifico",
  "categoria": "string",
  "familia": "string",
  "descricao": "string",
  "instrucoes_cuidado": "string",
  "img_url": "string",
  "periodicidade_rega": 2,
  "periodicidade_poda": 30,
  "periodicidade_adubo": 15
}
    resp_planta_catalogo = client.post("/catalogo/adicionar_planta_catalogo",headers = get_admin_header, json=planta_payload)

    assert resp_planta_catalogo.status_code == 201
    return resp_planta_catalogo.json()
    

@pytest.fixture
def planta_usuario(client:TestClient, get_admin_header, get_usuario_header_com_id, planta_catalogo):
    resp_planta_usuario = client.post(f'/planta/usuario/{get_usuario_header_com_id["id"]}/adicionar', headers=get_admin_header, json={
        "id": planta_catalogo["id"],
        "apelido": "plantinha",
        "data_plantio": '2025-12-24'
    })
    assert resp_planta_usuario.status_code == 201
    return resp_planta_usuario.json()
    
@pytest.fixture
def jardim_criado(client, get_usuario_header_com_id):
    response = client.post(
        "/jardim/criar_jardim",
        headers={'Authorization': get_usuario_header_com_id['Authorization']},
        json={"nome": "Jardim1"}
    )

    assert response.status_code == 201
    return response.json()

