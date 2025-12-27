#CA01
import pytest
@pytest.mark.parametrize("acao", ["rega", "poda", "adubo"])

def test_registrar_acao_valida(
    client, get_usuario_header, planta_usuario, acao
):
    response = client.post(
        f"/acao/{planta_usuario.id}/registrar",
        headers=get_usuario_header,
        json={
            "tipo": acao,
            "descricao": "ação de teste"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["tipo"] == acao

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
3#ca02
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
