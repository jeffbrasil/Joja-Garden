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

class TestCadastroPlantaCatalogo:
    """
        Suíte de testes responsável pela criação do catálogo de plantas
    """
    def test_admin_adiciona_planta_ao_catalogo(self, client:TestClient, admin_payload,get_admin_header, planta_catalogo_valida):
        
        client.post("admin/criar_conta", json = admin_payload)

        header = get_admin_header

        response = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)

        dados = response.json()

        assert(response.status_code == status.HTTP_201_CREATED)
        
        assert dados["nome_cientifico"] == planta_catalogo_valida["nome_cientifico"]
        assert "id" in dados
        assert dados["id"] is not None

    def test_admin_adiciona_planta_vazia(self, client:TestClient, get_admin_header):

        planta_vazia = {
            "nome": "",
            "nome_cientifico": "",
            "categoria" : "",
            "familia" : "",
            "descricao": "",
            "instrucoes_cuidado": "",
            "img_url" : "",
            "periodicidade_rega": "",
            "periodicidade_poda": "",
            "periodicidade_adubo": ""
        }

        header = get_admin_header

        response = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_vazia)

        assert(response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT)

    def test_admin_adiciona_payload_incorreto(self, client:TestClient, get_admin_header):
        payload_incompleto = {

            "nome" : "aaaaaaa"
        }
        header = get_admin_header

        response = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = payload_incompleto)

        assert(response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT)
    def test_admin_adiciona_duas_plantas_iguais_catalogo(self, client:TestClient, get_admin_header, planta_catalogo_valida):

        header = get_admin_header

        client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)

        response = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)

        assert(response.status_code == status.HTTP_400_BAD_REQUEST)
    
    def test_admin_adiciona_planta_sem_nome_cientifico(self, client:TestClient, get_admin_header, planta_catalogo_valida):
        "Não pode adicionar planta sem nome cientifico"
        
        planta_catalogo_valida["nome_cientifico"] = ""

        response = client.post(
            "/catalogo/adicionar_planta_catalogo",
            headers=get_admin_header,
            json=planta_catalogo_valida
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert "nome científico" in response.json()["detail"][0]["msg"].lower()

    def test_usuario_comum_nao_consegue_adicionar_planta_catalogo(self, client:TestClient, planta_catalogo_valida, get_admin_header, get_usuario_header):

        #criacao do user e o código de autenticação dele
        header = get_usuario_header
        response = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)

        assert(response.status_code == status.HTTP_403_FORBIDDEN)


class TestVisualizarCatalogo:

    def test_usuario_tenta_visualizar_catalogo_plantas(self, client:TestClient, get_usuario_header, get_admin_header, planta_catalogo_valida):

     
        header = get_admin_header
        response = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)

       
        header_usuario = get_usuario_header

     
        response = client.get("/catalogo/visualizar", headers = header_usuario)

        dados = response.json()

        assert(response.status_code == status.HTTP_200_OK)
        assert isinstance(dados, list)   
    
    def test_admin_tenta_visualizar_catalogo_plantas(self, client:TestClient, get_admin_header, planta_catalogo_valida):
       
        header = get_admin_header
        response = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)

        response = client.get("/catalogo/visualizar", headers = header)

        dados = response.json()
        assert(response.status_code == status.HTTP_200_OK)
        assert isinstance(dados, list)

    def test_visitante_nao_autenticado_tenta_visualizar_catalogo_plantas(self, client:TestClient , get_admin_header, planta_catalogo_valida):
        
        client.post("/catalogo/adicionar_planta_catalogo", headers = get_admin_header, json = planta_catalogo_valida)

        response = client.get("/catalogo/visualizar")

        assert(response.status_code == status.HTTP_401_UNAUTHORIZED)
    
    def test_admin_e_usuario_visualizam_catalogo_vazio(self, client:TestClient, get_admin_header, get_usuario_header):
        admin = client.get("/catalogo/visualizar")
        usuario = client.get("/catalogo/visualizar")

        dados_admin = admin.json()
        dados_usuario = usuario.json()

        assert(admin.status_code == status.HTTP_200_OK)
        assert(usuario.status_code == status.HTTP_200_OK)
        assert isinstance(dados_admin, list)
        assert isinstance(dados_usuario, list)

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
