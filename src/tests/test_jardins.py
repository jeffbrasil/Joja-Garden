from fastapi.testclient import TestClient
from fastapi import status


def test_usuario_cria_jardim_com_sucesso( client: TestClient, get_usuario_header):
    response = client.post(
        "/jardim/criar_jardim",
        headers=get_usuario_header,
        json={"nome": "Meu Jardim"}
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["nome"] == "Meu Jardim"

def test_usuario_nao_pode_criar_jardim_com_nome_duplicado( client: TestClient, get_usuario_header):
    client.post(
        "/jardim/criar_jardim",
        headers=get_usuario_header,
        json={"nome": "Jardim Repetido"}
    )

    response = client.post(
        "/jardim/criar_jardim",
        headers=get_usuario_header,
        json={"nome": "Jardim Repetido"}
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Já existe" in response.json()["detail"]

def test_aidiconar_planta_no_jardim( client: TestClient, planta_usuario,get_usuario_header_com_id, planta_catalogo, get_admin_header):
        
    jardim = client.post(
        "/jardim/criar_jardim",
        headers={"Authorization": get_usuario_header_com_id['Authorization']},
        json={"nome": "Meu Jardim"}
    )

    resp_planta_usuario = client.post(f'/planta/usuario/{get_usuario_header_com_id["id"]}/adicionar', headers=get_admin_header, json={
        "id": planta_catalogo["id"],
        "apelido": "plantinha",
        "data_plantio": '2025-12-24'
    })
    response2 = client.post(f'/jardim/{jardim.json()["id"]}/adicionar-planta/{resp_planta_usuario.json()["id"]}', headers={"Authorization": get_usuario_header_com_id['Authorization']})

    assert response2.status_code == status.HTTP_200_OK
    assert jardim.status_code == status.HTTP_201_CREATED   

def test_adicionar_planta_ja_pertence_ao_jardim(client: TestClient, get_usuario_header_com_id, planta_catalogo, get_admin_header):
    header = {"Authorization": get_usuario_header_com_id['Authorization']}
    user_id = get_usuario_header_com_id["id"]

    jardim_resp = client.post("/jardim/criar_jardim", headers=header, json={"nome": "Jardim Teste Reuso"})
    jardim_id = jardim_resp.json()["id"]

    # 2. Adiciona a Planta ao Usuário
    planta_resp = client.post(f'/planta/usuario/{user_id}/adicionar', headers=get_admin_header, json={
        "id": planta_catalogo["id"],
        "apelido": "Plantinha Duplicada",
        "data_plantio": '2025-12-25'
    })
    planta_id = planta_resp.json()["id"]

    client.post(f'/jardim/{jardim_id}/adicionar-planta/{planta_id}', headers=header)
    
    #tenta add a msm planta
    response = client.post(f'/jardim/{jardim_id}/adicionar-planta/{planta_id}', headers=header)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "A planta atual já pertence ao jardim" in response.json()["detail"]

def test_adicionar_planta_jardim_nao_encontrado_ou_nao_pertence(client: TestClient, get_usuario_header):

    jardim_id_invalido = 99999 
    planta_id_qualquer = 1 

    response = client.post(f'/jardim/{jardim_id_invalido}/adicionar-planta/{planta_id_qualquer}', headers=get_usuario_header)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Jardim não encontrado" in response.json()["detail"]

def test_adicionar_planta_planta_nao_encontrada_ou_nao_pertence(client: TestClient, get_usuario_header):

    jardim_resp = client.post("/jardim/criar_jardim", headers=get_usuario_header, json={"nome": "Jardim Planta Invalida"})
    jardim_id = jardim_resp.json()["id"]
    
    # Tenta adicionar uma PlantaUsuario que não existe ou não pertence ao usuário (MISSING 3)
    planta_id_invalida = 99999 

    response = client.post(f'/jardim/{jardim_id}/adicionar-planta/{planta_id_invalida}', headers=get_usuario_header)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Planta não encontrada no cadastro do usuário" in response.json()["detail"]
def test_listar_meus_jardins_sucesso_vazio(client: TestClient, get_usuario_header):
    response = client.get("/jardim/meus-jardins", headers=get_usuario_header)    
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []

def test_remover_jardim_nao_encontrado_ou_nao_pertence(client: TestClient, get_usuario_header):
    jardim_id_invalido = 99999 # Um ID que não existe.
    
    # Tenta remover um jardim que não existe ou não é do usuário (MISSING 1)
    response = client.delete(f"/jardim/{jardim_id_invalido}", headers=get_usuario_header)

    # Note: O status 400 é retornado se o jardim não for encontrado OU não pertencer ao usuário.
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Jardim não encontrado" in response.json()["detail"]


def test_remover_jardim_com_plantas(client: TestClient, get_usuario_header_com_id, planta_catalogo, get_admin_header):
    header = {"Authorization": get_usuario_header_com_id['Authorization']}
    user_id = get_usuario_header_com_id["id"]
    
    # Cria o Jardim
    jardim_resp = client.post("/jardim/criar_jardim", headers=header, json={"nome": "Jardim Com Plantas"})
    jardim_id = jardim_resp.json()["id"]

    #Adiciona a Planta ao User
    planta_resp = client.post(f'/planta/usuario/{user_id}/adicionar', headers=get_admin_header, json={
        "id": planta_catalogo["id"],
        "apelido": "Plantinha Presa",
        "data_plantio": '2025-12-26'
    })
    planta_id = planta_resp.json()["id"]
    #add planta no jardim
    client.post(f'/jardim/{jardim_id}/adicionar-planta/{planta_id}', headers=header)
    #tenta deletar jardim com planta
    response = client.delete(f"/jardim/{jardim_id}", headers=header)
    
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "O jardim precisa estar sem plantas para ser excluido" in response.json()["detail"]


def test_remover_jardim_sucesso(client: TestClient, get_usuario_header):
    
    jardim_resp = client.post("/jardim/criar_jardim", headers=get_usuario_header, json={"nome": "Jardim Para Excluir"})
    jardim_id = jardim_resp.json()["id"]

    
    response = client.delete(f"/jardim/{jardim_id}", headers=get_usuario_header)
    
    assert response.status_code == status.HTTP_200_OK
    assert "Jardim excluído com sucesso" in response.json()["msg"]
