from fastapi.testclient import TestClient
from fastapi import status

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

def test_aidiconar_planta_no_jardim(client: TestClient, planta_usuario,get_usuario_header_com_id):
     
    jardim = client.post(
        "/jardim/criar_jardim",
        headers={"Authorization": get_usuario_header_com_id['Authorization']},
        json={"nome": "Meu Jardim"}
    )
    response2 = client.post(f'/jardim/{jardim.json()["id"]}/adicionar-planta/{planta_usuario["id"]}', headers={"Authorization": get_usuario_header_com_id['Authorization']})
    assert response2.status_code == status.HTTP_200_OK
    assert jardim.status_code == status.HTTP_201_CREATED

# def test_nao_pode_adicionar_planta_que_nao_e_do_usuario(
#     client, get_usuario_header, jardim_criado
# ):
#     response = client.post(
#         f"/{jardim_criado['id']}/adicionar-planta/999",
#         headers=get_usuario_header
#     )

#     assert response.status_code == 404



