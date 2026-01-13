from fastapi.testclient import TestClient
from fastapi import status
from main.models.user import Super_usuario
from sqlalchemy.orm import Session

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
    "endereco" : "rua 1"
     
}
def get_admin_header(client:TestClient):

            client.post("admin/criar_conta", json = admin_valido)

            login = {"username" : admin_valido["cpf"], "password" : admin_valido["senha"]}
            response = client.post("/auth/token", data = login)
            assert response.status_code == 200, f"Login falhou: {response.json()}"
            token = response.json()["access_token"]
            return {"Authorization" : f"Bearer {token}"}

class TestCriarAdmin:
    def test_create_admin(self, client: TestClient):

        rota = client.post("admin/criar_conta", json=admin_valido)

        assert rota.status_code == status.HTTP_201_CREATED

        data = rota.json()
        assert "id" in data
        assert data["cpf"] == admin_valido["cpf"]
        assert data["nome"] == admin_valido["nome"]
        assert "senha" not in data

    def test_criar_admin_cpf_iguais(self, client: TestClient):

        response = client.post("admin/criar_conta", json=admin_valido)
        response2 = client.post("admin/criar_conta", json=admin_valido)

        assert response.status_code == status.HTTP_201_CREATED
        assert response2.status_code == status.HTTP_400_BAD_REQUEST

    def test_criar_admin_cpf_diferentes(self, client: TestClient):

        admin2 = {
            "nome" : "João",
            'cpf' : "89854749010",
            "senha" : "A144oEi%w[",
        }

        response = client.post("admin/criar_conta", json = admin2)
        response2 = client.post("admin/criar_conta", json = admin_valido)

        assert(response.status_code == status.HTTP_201_CREATED)
        assert(response2.status_code == status.HTTP_201_CREATED)

    def test_criar_admin_vazio(self,client: TestClient):
        admin_nulo = {}
        response = client.post("admin/criar_conta", json = admin_nulo)

        assert(response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT)

    def test_criar_admin_sem_campos_obrigatorios(self,client: TestClient):
        admin = {
            "nome" : "pikachu"
        }

        response = client.post("admin/criar_conta", json = admin)
        assert(response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT)

    def test_verificar_polimorfismo(self,client: TestClient):

        response = client.post("admin/criar_conta", json = admin_valido)
        print(response)
        response = response.json()

        assert (response is not None)
        assert (response["tipo_usuario"] == "admin")

    def test_criar_admin_cpf_invalido(self, client: TestClient):
        admin_invalido = admin_valido.copy()
        admin_invalido["cpf"] = "12345678900" 
        
        response = client.post("admin/criar_conta", json=admin_invalido)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "CPF inválido" in response.json()["detail"]

    def test_criar_admin_senha_invalida(self, client: TestClient):
        admin_invalido = admin_valido.copy()
        admin_invalido["senha"] = "senha123"
        
        response = client.post("admin/criar_conta", json=admin_invalido)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Senha inválida" in response.json()["detail"]

    class TestCadastroUSuario:

        """Suíte de teste para o cadastro de usuario"""
            
        def test_cadastro_usuario_sucesso(self,client:TestClient):

            header = get_admin_header(client)

            response = client.post("usuario", headers = header, json = usuario_valido)

            assert(response.status_code == status.HTTP_201_CREATED)
            dados = response.json()
            
            assert(dados["nome"] == usuario_valido["nome"])
            assert(dados["tipo_usuario"] == "usuario")
            assert(dados["email"] == usuario_valido ["email"])
            assert "id" in dados
            assert "senha" not in dados

        def test_cadastro_cliente_vazio(self, client:TestClient):
             
            header = get_admin_header(client)
            
            cliente_vazio = {
                "nome" : "",
                "cpf" : "",
                "email" : "",
                "senha" : "",
                "endereco" :""
            }

            response = client.post("usuario", json = cliente_vazio, headers= header)
            assert(response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT)
        
        def test_cadastro_usuario_admin_sem_autenticacao(self, client:TestClient):
             
             response = client.post("usuario", json = usuario_valido)
             assert(response.status_code == status.HTTP_401_UNAUTHORIZED)
        
        def test_criar_usuario_cpf_duplicado(self, client:TestClient):
             
             header = get_admin_header(client)

             client.post("usuario", json = usuario_valido, headers = header)
             response = client.post("usuario", json = usuario_valido, headers = header)

             assert(response.status_code == status.HTTP_400_BAD_REQUEST)


    class TestLoginAdmin:

        """
            Testes para verificar o login do administrador
        """

        def test_login_admin_sucesso(self, client:TestClient):
                
            client.post("admin/criar_conta", json= admin_valido)

            login = {
               
                  "username": "08601441009",
                 "password": "Gri90p2M@8(Y",
            }

            response = client.post("/auth/token", data = login)

            assert(response.status_code == status.HTTP_200_OK)
            assert("access_token" in response.json())
            assert(response.json()["token_type"] == "bearer")

        def test_login_admin_senha_invalida(self, client:TestClient):

            client.post("admin/criar_conta" , json = admin_valido)

            login = {
                "username": "08601441009",
                "password" : "12345678"
            }

            response = client.post("auth/token", data = login)

            assert (response.status_code == status.HTTP_401_UNAUTHORIZED)
            assert ("incorreto" in response.json()["detail"])

    class TestLoginUsuario:
        

        def test_login_usuario_sucesso(self, client:TestClient):
            header = get_admin_header(client)
            client.post("usuario", headers = header, json = usuario_valido)

            login = {
                "username": "37025142018",
                "password": "Senha_cliente1",
            }

            response = client.post("auth/token", data = login)

            assert(response.status_code == status.HTTP_200_OK)
            assert("access_token" in response.json())
            assert(response.json()["token_type"] == "bearer")
        
        def test_login_usuario_fracasso(self, client:TestClient):

            header = get_admin_header(client)
            client.post("usuario", headers = header, json = usuario_valido)

            login = {
                "username": "11122233344",
                "password": "45678978965",
            }

            response = client.post("auth/token", data = login)

            assert (response.status_code == status.HTTP_401_UNAUTHORIZED)
            assert ("incorreto" in response.json()["detail"])

class TestTentaLerAdmin:
    def test_ler_admin_existente(self, client: TestClient, get_admin_header):
            
        #cria segundo admin para ser lido
            admin_payload_2 = {
                "nome": "admin_test_2",
                "cpf": "528.453.100-05",
                "senha": "Senha123"
            }

            response = client.post("admin/criar_conta", json = admin_payload_2)
            assert response.status_code == status.HTTP_201_CREATED
                    
            response_2 = client.get(f"/admin/{response.json()['id']}", headers=get_admin_header)
            
            assert response_2.status_code == status.HTTP_200_OK
            assert response_2.json()["id"] == response.json()['id']
            assert response_2.json()["nome"] == admin_payload_2['nome']

    def test_ler_admin_nao_encontrado(self, client: TestClient, get_admin_header):
        admin_id_inexistente = 99999 
            
        response = client.get(f"/admin/{admin_id_inexistente}", headers=get_admin_header)
            
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Administrador não encontrado" in response.json()["detail"]

class TestAlterarSenhaAdmin:

    def test_alterar_senha_sucesso(self, client: TestClient, db_session: Session, get_admin_header):
        admin_logado = db_session.query(Super_usuario).filter(Super_usuario.cpf == admin_valido['cpf']).first()
        admin_id = admin_logado.id

        dados_alteracao = {
            "senha_atual": admin_valido["senha"],
            "nova_senha": "NovaSenhaSegura123!", # Senha nova e válida
        }
        
        response = client.put(f"/admin/{admin_id}/alterar-senha", headers=get_admin_header, json=dados_alteracao)
        
        assert response.status_code == status.HTTP_200_OK
        assert "A senha foi alterada com sucesso" in response.json()["msg"]

    def test_alterar_senha_atual_incorreta(self, client: TestClient, db_session: Session, get_admin_header):
        admin_logado = db_session.query(Super_usuario).filter(Super_usuario.cpf == admin_valido['cpf']).first()
        admin_id = admin_logado.id

        dados_alteracao = {
            "senha_atual": "SenhaErrada!", # Senha atual incorreta (MISSING)
            "nova_senha": "NovaSenhaSegura123!",
        }
        
        response = client.put(f"/admin/{admin_id}/alterar-senha", headers=get_admin_header, json=dados_alteracao)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "A senha atual está incorreta" in response.json()["detail"]

    def test_alterar_senha_nova_igual_a_atual(self, client: TestClient, db_session: Session, get_admin_header):
        admin_logado = db_session.query(Super_usuario).filter(Super_usuario.cpf == admin_valido['cpf']).first()
        admin_id = admin_logado.id

        dados_alteracao = {
            "senha_atual": admin_valido["senha"],
            "nova_senha": admin_valido["senha"], 
        }
        
        response = client.put(f"/admin/{admin_id}/alterar-senha", headers=get_admin_header, json=dados_alteracao)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "A nova senha deve ser diferente da atual" in response.json()["detail"]

    def test_alterar_senha_nova_senha_invalida(self, client: TestClient, db_session: Session, get_admin_header):
        admin_logado = db_session.query(Super_usuario).filter(Super_usuario.cpf == admin_valido['cpf']).first()
        admin_id = admin_logado.id

        dados_alteracao = {
            "senha_atual": admin_valido["senha"],
            "nova_senha": "senhamuitocurta",
        }
        
        response = client.put(f"/admin/{admin_id}/alterar-senha", headers=get_admin_header, json=dados_alteracao)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Senha inválida" in response.json()["detail"]

class TestDeletarAdmin:

    def test_deletar_admin_sucesso(self, client: TestClient, db_session: Session, get_admin_header):

        #cria segundo admin para ser apagado
        admin_payload_2 = {
                "nome": "admin_test_2",
                "cpf": "528.453.100-05",
                "senha": "Senha123"
        }

        response = client.post("/admin/criar_conta", json = admin_payload_2)
        assert response.status_code == status.HTTP_201_CREATED
        admin_id_deletar = response.json()["id"]

        #deleta usuario
        response_2 = client.delete(f"/admin/{admin_id_deletar}", headers=get_admin_header)

        assert response_2.status_code == status.HTTP_200_OK
        assert f"Administrador {admin_payload_2['nome']} foi deletado por outro Administrador." in response_2.json()["message"]
        
        # Verifica se o admin foi realmente deletado
        response_leitura = client.get(f"/admin/{admin_id_deletar}", headers=get_admin_header)
        assert response_leitura.status_code == status.HTTP_404_NOT_FOUND

    def test_deletar_admin_nao_encontrado(self, client: TestClient, get_admin_header):
    
        admin_id_inexistente = 99999 

        response = client.delete(f"/admin/{admin_id_inexistente}", headers=get_admin_header)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert f"Administrador com ID {admin_id_inexistente} não encontrado." in response.json()["detail"]

    def test_admin_tentar_se_auto_deletar(self, client: TestClient, db_session: Session, get_admin_header):
        
        admin_logado = db_session.query(Super_usuario).filter(Super_usuario.cpf == admin_valido['cpf']).first()
        admin_id_logado = admin_logado.id 

        response = client.delete(f"/admin/{admin_id_logado}", headers=get_admin_header)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Não é permitido que um administrador se auto-delete." in response.json()["detail"]

import pytest 
from fastapi.testclient import TestClient
from fastapi import status

# --- Assumindo Fixtures existentes ---
# get_admin_header: Token/Header do Admin ativo
# O payload para esta rota é do tipo EsqueceuSenha, que só exige 'nova_senha'

class TestAdminRedefinirSenhaCoverage:

    def test_admin_alterar_minha_senha_nova_senha_invalida(self, client: TestClient, get_admin_header):

        header_admin = get_admin_header        
   
        senha_invalida_payload = {
            "nova_senha": "minha_senha" 
        }
        response = client.put(
            "/admin/alterar-minha-senha",
            headers=header_admin,
            json=senha_invalida_payload
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["detail"] == "Senha inválida"
    