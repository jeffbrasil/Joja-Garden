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
