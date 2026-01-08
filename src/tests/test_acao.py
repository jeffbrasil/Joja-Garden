import pytest
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import status

@pytest.mark.parametrize("acao", ["poda", "rega", "adubo"])
def test_registrar_acao_valida(client: TestClient, get_usuario_header_com_id, planta_usuario, acao):
    response = client.post(f'acao/{planta_usuario["id"]}/registrar', headers={"Authorization": get_usuario_header_com_id["Authorization"]}, json={"tipo": acao, "descricao": "string", "data_hora": "2025-12-24"})
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()['tipo'] == acao

@pytest.mark.parametrize("acao", ["rega"])
def test_regristo_horario_falha(client:TestClient, get_usuario_header_com_id, planta_usuario, acao):
    response = client.post(f'/acao/{planta_usuario["id"]}/registrar', headers={"Authorization": get_usuario_header_com_id['Authorization']}, json={"tipo": acao, "descricao": "string"})
    assert response.json()["detail"][0]["loc"][1] == "data_hora"
    assert response.json()["detail"][0]["type"] == "missing"
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

@pytest.mark.parametrize("acao", ["poda"])
def test_regristo_horario_funciona(client:TestClient, get_usuario_header_com_id, planta_usuario, acao):
    response = client.post(f"/acao/{planta_usuario["id"]}/registrar", headers={"Authorization": get_usuario_header_com_id['Authorization']}, json={"tipo": acao, "descricao": "string", "data_hora": "2025-12-24"})
    assert "data_hora" in response.json()
    assert response.status_code == status.HTTP_201_CREATED

def test_listar_historico(client:TestClient, get_usuario_header_com_id, planta_usuario):
    #criacao de 2 acoes para a lista nao ficar vazia
    header = {"Authorization": get_usuario_header_com_id["Authorization"]}
    plantaId = planta_usuario["id"]
    acao1 = {
        "tipo": "poda", 
        "descricao": "string", 
        "data_hora": "2025-12-23"
    }
    acao2 = {
        "tipo": "adubo", 
        "descricao": "string", 
        "data_hora": "2025-12-24"
    }
    res1 = client.post(f"/acao/{plantaId}/registrar", headers=header, json=acao1)
    assert res1.status_code == status.HTTP_201_CREATED

    res2 = client.post(f"/acao/{plantaId}/registrar", headers=header, json=acao2)
    assert res2.status_code == status.HTTP_201_CREATED

    res3 = client.get(f'/acao/{plantaId}/acoes', headers=header)

    assert res3.status_code == status.HTTP_200_OK
    assert len(res3.json()) == 2
    assert res3.json()[1]['tipo'] == 'poda'
    assert res3.json()[0]['tipo'] == 'adubo'

    assert res3.json()[1]['data_hora'] < res3.json()[0]['data_hora']
