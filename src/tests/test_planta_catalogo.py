import pytest 
from fastapi.testclient import TestClient
from main.models.user import Super_usuario
from main.models.plant import PlantaCatalogo
from fastapi import status

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

    def test_admin_adiciona_duas_plantas_iguais_catalogo(self, client:TestClient, get_admin_header, planta_catalogo_valida):

        header = get_admin_header

        client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)

        response = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)

        assert(response.status_code == status.HTTP_400_BAD_REQUEST)
    
    def test_admin_adiciona_planta_sem_nome_cientifico(self, client:TestClient, get_admin_header, planta_catalogo_valida):
        """
            ATENÇÃO: verificar se este teste é válido, da forma como nosso código está estruturado, 
            ele permite cadastrar uma planta sem necessariamente precisar do nome cientifico. Verificar
            no product backlog
        """
        
        planta_catalogo_valida["nome_cientifico"] = ""

        header = get_admin_header
        
        response = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)

        assert (response.status_code == status.HTTP_400_BAD_REQUEST)

    def test_usuario_comum_nao_consegue_adicionar_planta_catalogo(self, client:TestClient, planta_catalogo_valida, get_admin_header, get_usuario_header):

        #criacao do user e o código de autenticação dele
        header = get_usuario_header
        response = client.post("/catalogo/adicionar_planta_catalogo", headers = header, json = planta_catalogo_valida)

        assert(response.status_code == status.HTTP_403_FORBIDDEN)
