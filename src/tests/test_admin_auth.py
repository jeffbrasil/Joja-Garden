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

            