from fastapi.testclient import TestClient
from fastapi import status
import pytest

@pytest.fixture
def cenario(client:TestClient, get_admin_header,get_usuario_header,planta_catalogo_payload, usuario_payload):
    header = get_admin_header
   
    usuario_id = 2
    planta = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_payload)
    id_planta = planta.json()["id"]
    
    planta_usuario = {
        "id" : id_planta
    }
    response = client.post(f"/planta/usuario/{usuario_id}/adicionar", headers = header, json = planta_usuario)
    planta_usuario_id = response.json()["id"]

    return {
        "headers" : get_usuario_header,
        "planta_usuario_id" : planta_usuario_id,
        "planta_id" : id_planta,
        "planta_dados" : planta_catalogo_payload
    }

def test_usuario_cria_jardim_com_sucesso(client: TestClient, get_usuario_header):
    response = client.post(
        "/jardim/criar_jardim",
        headers=get_usuario_header,
        json={"nome": "Meu Jardim"}
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["nome"] == "Meu Jardim"

def test_usuario_nao_pode_criar_jardim_com_nome_duplicado(client: TestClient, get_usuario_header):
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

'''
To precisando de um GET pra buscar a planta do usuario pelo ID, ou que ao adicionar a planta num jardim tenho um retorno de como o jardim está e não só uma mensagem
'''
# def test_aidiconar_planta_no_jardim(client: TestClient, jardim_criado, planta_usuario,get_usuario_header_com_id):
#     response = client.post(f'/jardim/{jardim_criado["id"]}/adicionar-planta/{planta_usuario["id"]}', headers={"Authorization": get_usuario_header_com_id['Authorization']})
#     assert response.status_code == status.HTTP_200_OK
#     assert len(jardim_criado['plantas']) == 1

    

# def test_nao_pode_adicionar_planta_que_nao_e_do_usuario(
#     client, get_usuario_header, jardim_criado
# ):
#     response = client.post(
#         f"/{jardim_criado['id']}/adicionar-planta/999",
#         headers=get_usuario_header
#     )

#     assert response.status_code == 404


class TestAdicionarPlantaAJardim:

    def test_usuario_adiciona_planta_a_jardim_com_sucesso(self, client:TestClient, cenario):
        #precisa criar um admin,usuario,adicionar uma planta ao catálogo, adicionar a planta ao usuário
        #por fim o usuario adicionar esta planta ao jardim
        #usuario cria um jardim

        header_usuario = cenario["headers"]
        jardim = client.post("/jardim/criar_jardim", headers=header_usuario, json={"nome": "Meu Jardim"})
        jardim_id = jardim.json()["id"]
        #usuario adiciona planta a jardim
        planta_id = cenario["planta_usuario_id"]
        dados_movimentacao = { "jardim_novo" : jardim_id}
        response = client.put(f"/jardim/{planta_id}/mover-planta", headers = header_usuario, json = dados_movimentacao)

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"msg" : "Planta movida com sucesso"}


