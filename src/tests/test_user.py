from fastapi.testclient import TestClient
from fastapi import status
from sqlalchemy.orm import Session
from main.models.user import Usuario

# --- MOCKS E DADOS PARA TESTE ---
admin_valido = {
    "nome": "Admin Teste",
    "cpf": "08601441009",
    "senha": "Gri90p2M@8(Y",
}

usuario_valido = {
    "nome": "Cliente Feliz",
    "cpf": "37025142018",
    "email": "cliente@email.com",
    "senha": "Senha_cliente1",
    "endereco": "rua 1"
}



class TestUsuario:

    def test_criar_usuario_cpf_invalido_formato(self, client: TestClient, get_admin_header):
        usuario_invalido = usuario_valido.copy()
        usuario_invalido["cpf"] = "123"  
        response = client.post("/usuario/", json=usuario_invalido, headers=get_admin_header)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "CPF inválido" in response.json()["detail"]

    def test_criar_usuario_senha_fraca(self, client: TestClient, get_admin_header):
        usuario_invalido = usuario_valido.copy()
        usuario_invalido["senha"] = "123"  # Senha fraca
        
        response = client.post("/usuario/", json=usuario_invalido, headers=get_admin_header)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Senha inválida" in response.json()["detail"]

    def test_criar_usuario_email_duplicado(self, client: TestClient, get_admin_header):

        # Garante que o primeiro existe
        client.post("/usuario/", json=usuario_valido, headers=get_admin_header)
        
        usuario_clone = usuario_valido.copy()
        usuario_clone["cpf"] = "068.427.670-40" # Outro CPF válido
        usuario_clone["email"] = usuario_valido["email"] # Mesmo email
        
        response = client.post("/usuario/", json=usuario_clone, headers=get_admin_header)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email já cadastrado" in response.json()["detail"]

    def test_ler_usuario_cpf_nao_encontrado(self, client: TestClient, get_admin_header):
        cpf_inexistente = "99999999999" #
        
        response = client.get(f"/usuario/dados?cpf={cpf_inexistente}", headers=get_admin_header)
        
        assert response.status_code == 400
        assert "Usuario não encontrado" in response.json()["detail"]

    def test_meus_dados_como_usuario(self, client: TestClient, get_usuario_header):

        response = client.get("/usuario/dados-cadastrais", headers=get_usuario_header, )
        
        assert response.status_code == status.HTTP_200_OK
        dados = response.json()
        assert dados['nome'] == "Cliente Feliz"

    def test_listar_todos_usuarios(self, client: TestClient, get_admin_header):

        # Garante que tem pelo menos um criado
        client.post("/usuario/", json=usuario_valido, headers=get_admin_header)
        
        response = client.get("/usuario/all", headers=get_admin_header)
        
        assert response.status_code == status.HTTP_200_OK
        lista = response.json()
        assert isinstance(lista, list)
        assert len(lista) >= 1

    # def test_buscar_email_erros(self, client: TestClient, get_admin_header):
    #     response = client.get("/usuario/email?cpf=123")
    #     assert response.status_code == status.HTTP_400_BAD_REQUEST
    #     assert "Formato de CPF inválido" in response.json()["detail"]
       
    #     cpf_valido_inexistente = "424.384.350-38"
    #     response_2 = client.get(f"/usuario/email?cpf={cpf_valido_inexistente}")
    #     assert response_2.status_code == status.HTTP_404_NOT_FOUND
    #     assert "Usuário não encontrado" in response_2.json()["detail"]

    def test_alterar_senha_falhas(self, client: TestClient, get_usuario_header):

        payload_senha_errada = {
            "senha_atual": "SenhaErrada123",
            "nova_senha": "NovaSenhaTop1@"
        }
        resp1 = client.put("/usuario/alterar-senha", json=payload_senha_errada, headers=get_usuario_header)
        assert resp1.status_code == status.HTTP_400_BAD_REQUEST
        assert "A senha atual está incorreta" in resp1.json()["detail"]
        
        payload_senha_igual = {
            "senha_atual": usuario_valido["senha"],
            "nova_senha": usuario_valido["senha"]
        }
        resp2 = client.put("/usuario/alterar-senha", json=payload_senha_igual, headers=get_usuario_header)
        assert resp2.status_code == status.HTTP_400_BAD_REQUEST
        assert "A nova senha deve ser diferente da atual" in resp2.json()["detail"]
   
        payload_nova_fraca = {
            "senha_atual": usuario_valido["senha"],
            "nova_senha": "senha123"
        }
        resp3 = client.put("/usuario/alterar-senha", json=payload_nova_fraca, headers=get_usuario_header)
        assert resp3.status_code == status.HTTP_400_BAD_REQUEST
        assert "Senha inválida" in resp3.json()["detail"]

    def test_deletar_usuario_nao_encontrado(self, client: TestClient, get_admin_header):
        id_inexistente = 999999
        response = client.delete(f"/usuario/{id_inexistente}", headers=get_admin_header)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert f"Usuário com ID {id_inexistente} não encontrado" in response.json()["detail"]

    def test_deletar_usuario(self, client: TestClient, get_admin_header):

        response_1 = client.post('/usuario', headers=get_admin_header, json=usuario_valido)
        id_user = response_1.json()['id']
        nome_user = response_1.json()['nome']
        assert response_1.status_code == status.HTTP_201_CREATED

        response = client.delete(f"/usuario/{id_user}", headers=get_admin_header)
        assert response.status_code == status.HTTP_200_OK
        
        assert response.status_code == status.HTTP_200_OK
        assert f"Usuário {nome_user} foi deletado." in response.json()["message"]

    def test_ler_usuario_cpf_inexistente_mas_valido(self, client: TestClient, get_admin_header):
        # CPF válido (formato) mas que não foi cadastrado
        cpf_nao_cadastrado = "196.719.620-68" 
        
        response = client.get(f"/usuario/dados?cpf={cpf_nao_cadastrado}", headers=get_admin_header)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Usuario não encontrado" in response.json()["detail"]

    def test_meus_dados_sendo_admin(self, client: TestClient, get_admin_header):
        
        response = client.get("/usuario/dados-cadastrais", headers=get_admin_header)
        
        assert response.status_code == status.HTTP_200_OK
        dados = response.json()
        assert dados["nome"] == "Admin Teste"
    # def test_buscar_email_usuario_nao_encontrado(self, client: TestClient):
        
    #     # CPF válido, mas usuário inexistente
    #     cpf_fake = "348.571.620-08"
        
    #     response = client.get(f"/usuario/email?cpf={cpf_fake}")
        
    #     assert response.status_code == status.HTTP_404_NOT_FOUND
    #     assert "Usuário não encontrado" in response.json()["detail"]
    def test_alterar_senha_nova_senha_fraca(self, client: TestClient, get_usuario_header):

        payload = {
            "senha_atual": "Senha_cliente1",
            "nova_senha": "Senhaaaa" 
        }
        
        response = client.put("/usuario/alterar-senha", json=payload, headers=get_usuario_header)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Senha inválida" in response.json()["detail"]

    def test_alterar_senha_fluxo_completo_sucesso(self, client: TestClient, get_usuario_header):
 
        payload = {
            "senha_atual": "Senha_cliente1",
            "nova_senha": "NovaSenhaForte@2024" 
        }
        
        response = client.put("/usuario/alterar-senha", json=payload, headers=get_usuario_header)
        
        assert response.status_code == status.HTTP_200_OK
        assert "A senha foi alterada com sucesso" in response.json()["msg"]
        
        # Opcional: Tentar logar com a senha nova para garantir
        login_novo = {"username": "13765913081", "password": "NovaSenhaForte@2024"}
        resp_login = client.post("/auth/token", data=login_novo)
        assert resp_login.status_code == 200
    def test_ler_usuario_cpf_nao_encontrado(self, client: TestClient, get_admin_header):

        cpf_inexistente_valido = "012.144.320-50" 
        
        response = client.get(
            f"/usuario/dados?cpf={cpf_inexistente_valido}",
            headers=get_admin_header
        )
        
        # O código espera 400 Bad Request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["detail"] == "Usuario não encontrado"