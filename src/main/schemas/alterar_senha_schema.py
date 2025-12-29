from pydantic import BaseModel, Field

class AlterarSenha(BaseModel):

    senha_atual: str = Field(..., description="A senha que o admin usa atualmente")
    nova_senha: str = Field(..., min_length=8, description="A nova senha desejada")