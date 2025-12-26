def test_usuario_cria_jardim_com_sucesso(client, get_usuario_header):
    response = client.post(
        "/criar_jardim",
        headers=get_usuario_header,
        json={"nome": "Meu Jardim"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["nome"] == "Meu Jardim"

def test_usuario_nao_pode_criar_jardim_com_nome_duplicado(client, get_usuario_header):
    client.post(
        "/criar_jardim",
        headers=get_usuario_header,
        json={"nome": "Jardim Repetido"}
    )

    response = client.post(
        "/criar_jardim",
        headers=get_usuario_header,
        json={"nome": "Jardim Repetido"}
    )

    assert response.status_code == 400
    assert "Já existe" in response.json()["detail"]

def test_nao_pode_adicionar_planta_que_nao_e_do_usuario(
    client, get_usuario_header, jardim_criado
):
    response = client.post(
        f"/{jardim_criado.id}/adicionar-planta/999",
        headers=get_usuario_header
    )

    assert response.status_code == 404



