from pydantic import BaseModel, Field

class EsqueceuSenha(BaseModel):
    nova_senha: str = Field(..., min_length=8, description="A nova senha desejada")