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
