from locust import HttpUser, task, between
from random import choice
from typing import List


USER_TOKEN = "Bearer token-de-usuario" 

class UsuarioComum(HttpUser):
    wait_time = between(1, 2.5) 
    host = "http://localhost:8000" 
    
   
    plantas_ids: List[int] = []

    def on_start(self):
        #primeiro obtem os dados
        self.client.headers = {"Authorization": USER_TOKEN}

        
        try:
            response = self.client.get("/planta/minhas-plantas", name="SETUP: Listar Plantas (Obter IDs)")
            if response.status_code == 200 and response.json():
                plantas = response.json()
                self.plantas_ids = [p['id'] for p in plantas]
            
        except Exception as e:
            
            print(f"ERRO DE SETUP: Falha ao obter lista de plantas: {e}")
            
        
    @task(10) 
    def listar_plantas(self):
        self.client.get("/planta/minhas-plantas", name="GET /planta/minhas-plantas")

    @task(5) 
    def listar_jardins(self):
        self.client.get("/jardim/meus-jardins", name="GET /jardim/meus-jardins")
        
    @task(1) 
    def listar_catalogo(self):
        self.client.get("/catalogo/visualizar", name="GET /catalogo/visualizar") 

    @task(1) 
    def listar_catalogo(self):
        self.client.get("/usuario/dados-cadastrais", name="GET /usuario/dados-cadastrais")
    
    
    @task(7) 
    def listar_galeria_de_planta(self):
        
        if not self.plantas_ids:
            return # Se não tiver IDs, pula o teste
            
        planta_id_selecionado = choice(self.plantas_ids)
        
        endpoint = f"/imagem/{planta_id_selecionado}/galeria" 
        self.client.get(endpoint, name="GET /imagem/[id]/galeria")
        
    @task(7) 
    def listar_acoes_de_planta(self):
        if not self.plantas_ids:
            return 
            
        planta_id_selecionado = choice(self.plantas_ids)
        endpoint = f"/acao/{planta_id_selecionado}/acoes" 
        self.client.get(endpoint, name="GET /acao/[id]/acoes")

