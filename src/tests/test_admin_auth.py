from fastapi.testclient import TestClient
from fastapi import status


admin1 = {
    "nome": "Admin Teste",
    "cpf": "12345678901",
    "senha": "SenhaSegura123",
}

def test_create_admin(client: TestClient):

    rota = client.post("admin/criar_conta", json=admin1)

    assert rota.status_code == status.HTTP_201_CREATED

    data = rota.json()
    assert "id" in data
    assert data["cpf"] == admin1["cpf"]
    assert data["nome"] == admin1["nome"]
    assert "senha" not in data

def test_criar_admin_cpf_iguais(client: TestClient):

    response = client.post("admin/criar_conta", json=admin1)
    response2 = client.post("admin/criar_conta", json=admin1)

    assert response.status_code == status.HTTP_201_CREATED
    assert response2.status_code == status.HTTP_400_BAD_REQUEST

def test_criar_admin_cpf_diferentes(client: TestClient):

    admin2 = {
        "nome" : "João",
        'cpf' : "12345678910",
        "senha" : "123456",
    }

    response = client.post("admin/criar_conta", json = admin2)
    response2 = client.post("admin/criar_conta", json = admin1)

    assert(response.status_code == status.HTTP_201_CREATED)
    assert(response2.status_code == status.HTTP_201_CREATED)
