from fastapi.testclient import TestClient
from fastapi import status
from main.models.user import Super_usuario
from sqlalchemy.orm import Session

admin_valido = {
    "nome": "Admin Teste",
    "cpf": "08601441009",
    "senha": "Gri90p2M@8(Y",
}

def test_create_admin(client: TestClient):

    rota = client.post("admin/criar_conta", json=admin_valido)

    assert rota.status_code == status.HTTP_201_CREATED

    data = rota.json()
    assert "id" in data
    assert data["cpf"] == admin_valido["cpf"]
    assert data["nome"] == admin_valido["nome"]
    assert "senha" not in data

def test_criar_admin_cpf_iguais(client: TestClient):

    response = client.post("admin/criar_conta", json=admin_valido)
    response2 = client.post("admin/criar_conta", json=admin_valido)

    assert response.status_code == status.HTTP_201_CREATED
    assert response2.status_code == status.HTTP_400_BAD_REQUEST

def test_criar_admin_cpf_diferentes(client: TestClient):

    admin2 = {
        "nome" : "João",
        'cpf' : "12345678910",
        "senha" : "A144oEi%w[",
    }

    response = client.post("admin/criar_conta", json = admin2)
    response2 = client.post("admin/criar_conta", json = admin_valido)

    assert(response.status_code == status.HTTP_201_CREATED)
    assert(response2.status_code == status.HTTP_201_CREATED)

def test_criar_admin_senha_menor_8_digitos(client: TestClient):
    admin_senha_pequena = {
        "cpf" : "24785993090",
        "nome" : "teste",
        "senha" : "1234567"
    }
    response = client.post("admin/criar_conta", json = admin_senha_pequena)
    assert(response.status_code == status.HTTP_400_BAD_REQUEST)

def test_criar_admin_senha_8_digitos_fraca(client: TestClient):

    admin_senha_fraca = {
        "nome" : "senha fraca",
        "cpf" : "24785993090",
        "senha" : "12345678",
    }

    response = client.post("admin/criar_conta" , json = admin_senha_fraca)
    assert(response.status_code == status.HTTP_400_BAD_REQUEST)

def test_criar_admin_vazio(client: TestClient):
    admin_nulo = {}
    response = client.post("admin/criar_conta", json = admin_nulo)

    assert(response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT)

def test_criar_admin_sem_campos_obrigatorios(client: TestClient):
    admin = {
        "nome" : "pikachu"
    }

    response = client.post("admin/criar_conta", json = admin)
    assert(response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT)

def test_verificar_polimorfismo(client: TestClient):

    response = client.post("admin/criar_conta", json = admin_valido)
    print(response)
    response = response.json()

    assert (response is not None)
    assert (response["tipo_usuario"] == "admin")

    