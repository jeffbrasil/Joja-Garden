import pytest 
from fastapi.testclient import TestClient
from main.models.user import Super_usuario
from main.models.plant import PlantaCatalogo
from fastapi import status


def test_usuario_adiciona_imagem_a_sua_planta(client:TestClient, get_admin_header, get_usuario_header, planta_catalogo_payload, usuario_payload):

    #cria planta em catálogo
    id_planta_catalogo= client.post("/catalogo/adicionar_planta_catalogo", headers = get_admin_header, json = planta_catalogo_payload).json()["id"]
    #adiciona planta ao usuario
    planta_usuario = {
            "id" : id_planta_catalogo
        }

    planta_id = client.post(f"/planta/usuario/{2}/adicionar", headers = get_admin_header, json = planta_usuario).json()["id"]
   
    imagem = {
        "url" : "blablabla.com",
        "descricao" : "blabla",
        "titulo" : "o bla"
    }
    #usuario tira a foto
    response = client.post(f"/imagem/{planta_id}/adicionar", headers = get_usuario_header, json = imagem)

    assert response.status_code == status.HTTP_201_CREATED

def test_usuario_adiciona_imagem_url_vazia(client:TestClient, get_admin_header, get_usuario_header, planta_catalogo_payload, usuario_payload):

    #cria planta em catálogo
    id_planta_catalogo= client.post("/catalogo/adicionar_planta_catalogo", headers = get_admin_header, json = planta_catalogo_payload).json()["id"]
    #adiciona planta ao usuario
    planta_usuario = {
            "id" : id_planta_catalogo
        }

    planta_id = client.post(f"/planta/usuario/{2}/adicionar", headers = get_admin_header, json = planta_usuario).json()["id"]
   
    imagem = {
        "url" : "",
        "descricao" : "blabla",
        "titulo" : "o bla"
    }
    #usuario tira a foto
    response = client.post(f"/imagem/{planta_id}/adicionar", headers = get_usuario_header, json = imagem)

    assert response.status_code == status.HTTP_201_CREATED

def test_usuario_tenta_adicionar_imagem_a_planta_inexistente(client:TestClient, get_admin_header, get_usuario_header, planta_catalogo_payload, usuario_payload):
    client.post("/catalogo/adicionar_planta_catalogo", headers = get_admin_header, json = planta_catalogo_payload)

    imagem = {
        "url" : "",
        "descricao" : "blabla",
        "titulo" : "o bla"
    }
    planta_id = 999
    response = client.post(f"/imagem/{planta_id}/adicionar", headers = get_usuario_header, json = imagem)

    assert(response.status_code == status.HTTP_404_NOT_FOUND)

def test_usuario_tenta_visualizar_galeria(client:TestClient, get_usuario_header_com_id, planta_usuario):
        #add img de planta primeiro
    imagem = {
          "url": "strin.jwp",
          "titulo": "planta bunita",
          "descricao": "plantinha"   
        }
    
    response = client.post(f"/imagem/{planta_usuario['id']}/adicionar", headers={"Authorization": get_usuario_header_com_id["Authorization"]}, json = imagem)
    #verifica se foi possivel
    response = client.get(f"/imagem/{planta_usuario['id']}/galeria", headers={"Authorization": get_usuario_header_com_id["Authorization"]})

    assert response.status_code == status.HTTP_200_OK


def test_usuario_tenta_visualizar_galeria_de_planta_que_nao_existe(client:TestClient, get_usuario_header_com_id, planta_usuario):
        #add img de planta primeiro
    imagem = {
          "url": "strin.jwp",
          "titulo": "planta bunita",
          "descricao": "plantinha"   
        }
    
    response = client.post(f"/imagem/{planta_usuario['id']}/adicionar", headers={"Authorization": get_usuario_header_com_id["Authorization"]}, json = imagem)
    #verifica se foi possivel
    response = client.get(f"/imagem/{999}/galeria", headers={"Authorization": get_usuario_header_com_id["Authorization"]})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() ==  {'detail': 'Planta não encontrada'}

def test_tenta_visualizar_galeria_de_usuario_que_nao_exsite(client:TestClient, planta_usuario, get_usuario_header, get_usuario_header_2):
    response = client.get(f"/imagem/{planta_usuario['id']}/galeria", headers=get_usuario_header_2)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() ==  {'detail': 'Usuario não encontrado'}

def testa_adiciona_imagem_a_usuario_que_nao_existe(client:TestClient, planta_usuario, get_usuario_header, get_usuario_header_2):
    imagem = {
          "url": "strin.jwp",
          "titulo": "planta bunita",
          "descricao": "plantinha"   
        }
    response = client.post(f"/imagem/{planta_usuario['id']}/adicionar", headers=get_usuario_header_2, json = imagem)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() ==  {'detail': 'Usuario não encontrado'}