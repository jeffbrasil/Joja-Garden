import pytest
from fastapi import status
from fastapi.testclient import TestClient
@pytest.mark.parametrize("acao", ["poda", "rega", "adubo"])
def test_registrar_acao_valida(
    client:TestClient,
    get_usuario_header,
    planta_usuario,
    acao
):
    response = client.post(
        f"/acao/{planta_usuario.id}/registrar",
        headers=get_usuario_header,
        json={"tipo": acao}
    )

    assert response.status_code == 201
    assert response.json()["tipo"] == acao




