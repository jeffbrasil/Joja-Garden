import pytest
from fastapi import status
from fastapi.testclient import TestClient
from fastapi import status

@pytest.mark.parametrize("acao", ["poda", "rega", "adubo"])
def test_registrar_acao_valida(client: TestClient, get_usuario_header_com_id, planta_usuario, acao):
    response = client.post(f"/acao/{planta_usuario["id"]}/registrar", headers={"Authorization": get_usuario_header_com_id["Authorization"]}, json={"tipo": acao, "descricao": "string", "data_hora": "2025-12-24"})
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()['tipo'] == acao




