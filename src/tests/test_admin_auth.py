from fastapi.testclient import TestClient
from fastapi import status


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
