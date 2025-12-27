#CA01
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import status

@pytest.mark.parametrize("acao", ["poda", "rega", "adubo"])
def test_registrar_acao_valida(client: TestClient, get_usuario_header_com_id, planta_usuario, acao):
    response = client.post(f"/acao/{planta_usuario["id"]}/registrar", headers={"Authorization": get_usuario_header_com_id["Authorization"]}, json={"tipo": acao, "descricao": "string", "data_hora": "2025-12-24"})
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()['tipo'] == acao

def test_nao_permite_acao_invalida(
    client, get_usuario_header, planta_usuario
):
    response = client.post(
        f"/acao/{planta_usuario.id}/registrar",
        headers=get_usuario_header,
        json={
            "tipo": "pintar",
            "descricao": "inválido"
        }
    )

    assert response.status_code == 400
#ca02
def test_acao_registra_data_hora(
    client, get_usuario_header, planta_usuario
):
    response = client.post(
        f"/acao/{planta_usuario.id}/registrar",
        headers=get_usuario_header,
        json={"tipo": "rega"}
    )

    assert "data_hora" in response.json()

def test_listar_historico_da_planta(
    client, get_usuario_header, planta_usuario
):
    response = client.get(
        f"/acao/{planta_usuario.id}/acoes",
        headers=get_usuario_header
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)
