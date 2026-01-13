import pytest 
from fastapi.testclient import TestClient
from main.models.user import Super_usuario
from main.models.plant import PlantaCatalogo
from fastapi import status

"""
Aqui estão os testes referentes a cadastro de planta no catálogo e adição de planta no perfil do usuário
"""
@pytest.fixture
def planta_catalogo_valida():
    return {
        "nome": "Samambaia Americana",
        "nome_cientifico": "Nephrolepis exaltata",
        "categoria" : "Polypodiales",
        "familia" : "Nephrolepidaceae",
        "descricao": "Gosta de sombra e umidade.",
        "instrucoes_cuidado": "Sombra parcial",
        "img_url" : "finge que tem um link aqui",
        "periodicidade_rega": "2",
        "periodicidade_poda": "30",
        "periodicidade_adubo": "15"
        
    }

class TestAdicionarPlantaAoUsuario:

    def test_admin_adiciona_planta_ao_usuario(self, client:TestClient, get_admin_header, usuario_payload, planta_catalogo_valida):
        header = get_admin_header
        usuario = client.post("usuario", headers = header, json = usuario_payload)
        usuario_id = usuario.json()["id"]
     
        planta = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)
        id_planta = planta.json()["id"]
       
        planta_usuario = {
            "id" : id_planta
        }
        response = client.post(f"/planta/usuario/{usuario_id}/adicionar", headers = header, json = planta_usuario)

        assert(response.status_code == status.HTTP_201_CREATED)

    def test_admin_adiciona_uma_planta_inexistente_ao_usuario(self, client:TestClient, get_admin_header, usuario_payload):
        
        header = get_admin_header
        usuario = client.post("usuario", headers = header, json = usuario_payload)
        usuario_id = usuario.json()["id"]
       
        planta_usuario = {
            "id" : 999
        }
        response = client.post(f"/planta/usuario/{usuario_id}/adicionar", headers = header, json = planta_usuario)

        assert(response.status_code == status.HTTP_400_BAD_REQUEST)
    
    def test_admin_tenta_adicionar_uma_planta_usuario_nao_existe(self, client:TestClient, get_admin_header, planta_catalogo_valida):
        header = get_admin_header

        usuario_id = 999

        planta = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)
        id_planta = planta.json()["id"]

        planta_usuario = {
            "id" : id_planta
        }
        response = client.post(f"/planta/usuario/{usuario_id}/adicionar", headers = header, json = planta_usuario)

        assert(response.status_code == status.HTTP_400_BAD_REQUEST)

    def test_usuario_tenta_adicionar_uma_planta_a_usuario(self, client:TestClient, get_admin_header, usuario_payload, planta_catalogo_valida, get_usuario_header):
        header = get_admin_header
        
        usuario2 = {
            "nome": "Cliente Dois",
            "cpf": "05270899078",
            "email": "blablabla@email.com",
            "senha": "Senha_cliente1",
            "endereco" : "rua 1" 
        }

        usuario2 = client.post("usuario", headers = header, json = usuario2)
       
        usuario_id = usuario2.json()["id"]
     
        planta = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)
        print(planta.json())
        id_planta = planta.json()["id"]
       
        planta_usuario = {
            "id" : id_planta
        }
        response = client.post(f"/planta/usuario/{usuario_id}/adicionar", headers = get_usuario_header, json = planta_usuario)

        assert(response.status_code == status.HTTP_403_FORBIDDEN)
    
    def test_visitante_tenta_adicionar_planta_a_usuario(self, client:TestClient, get_admin_header, usuario_payload, planta_catalogo_valida):
        header = get_admin_header
        usuario = client.post("usuario", headers = header, json = usuario_payload)
        usuario_id = usuario.json()["id"]
     
        planta = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)
        id_planta = planta.json()["id"]
       
        planta_usuario = {
            "id" : id_planta
        }
        response = client.post(f"/planta/usuario/{usuario_id}/adicionar", json = planta_usuario)

        assert(response.status_code == status.HTTP_401_UNAUTHORIZED)

class TestVisualizarPlantaUsuario:
    def test_visulizar_planta_do_usuario_sucesso(self, client:TestClient, get_usuario_header_com_id, planta_usuario):
        current_user = {'Authorization' : get_usuario_header_com_id['Authorization']}
        response = client.get(f'/planta/{planta_usuario["id"]}', headers=current_user)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()['apelido'] == planta_usuario['apelido']

    def test_visulizar_planta_do_usuario_fracasso(self, client:TestClient, get_usuario_header_com_id):
        current_user = {'Authorization' : get_usuario_header_com_id['Authorization']}
        response = client.get(f'/planta/{1}', headers=current_user)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()['detail'] == 'Planta não encontrada'



    # --- Testes para cobrir listar_minhas_plantas (GET /minhas-plantas) ---

def test_listar_minhas_plantas_lista_vazia( client: TestClient, get_usuario_header_2):

    header_usuario_b = get_usuario_header_2
        
    response = client.get("/planta/minhas-plantas", headers=header_usuario_b)

    assert response.status_code == status.HTTP_200_OK
      
    assert response.json() == []



def test_deletar_minha_planta_sucesso( client: TestClient, get_usuario_header_com_id, planta_usuario):

    header_usuario_a = {"Authorization": get_usuario_header_com_id["Authorization"]}
    planta_id = planta_usuario["id"]
    apelido_esperado = planta_usuario["apelido"]
        
    response = client.delete(f"/planta/{planta_id}", headers=header_usuario_a)

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == f"A planta {apelido_esperado} foi removida com sucesso de suas plantas."

       
    response_check = client.get(f"/planta/{planta_id}", headers=header_usuario_a)
    assert response_check.status_code == status.HTTP_400_BAD_REQUEST # A rota GET retorna 400 se não encontrar
    assert response_check.json()['detail'] == 'Planta não encontrada'


def test_deletar_planta_nao_encontrada_ou_de_outro_usuario( client: TestClient, get_usuario_header_com_id, planta_usuario, get_usuario_header_2):

    header_usuario_a = {"Authorization": get_usuario_header_com_id["Authorization"]}
    header_usuario_b = get_usuario_header_2
        
        
    planta_id_fake = 99999
    response_fake = client.delete(f"/planta/{planta_id_fake}", headers=header_usuario_a)
        
    assert response_fake.status_code == status.HTTP_404_NOT_FOUND
    assert response_fake.json()["detail"] == "Planta não encontrada ou não pertence a este usuário."
        
      
    planta_id_do_a = planta_usuario["id"]
        
    response_outro_user = client.delete(f"/planta/{planta_id_do_a}", headers=header_usuario_b)
        
    assert response_outro_user.status_code == status.HTTP_404_NOT_FOUND
    assert response_outro_user.json()["detail"] == "Planta não encontrada ou não pertence a este usuário."

def test_tenta_listar_plantas_do_usuario(client:TestClient, get_usuario_header_com_id):
    header_usuario_a = {"Authorization": get_usuario_header_com_id["Authorization"]}
    response = client.get("/planta/minhas-plantas", headers=header_usuario_a)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []

