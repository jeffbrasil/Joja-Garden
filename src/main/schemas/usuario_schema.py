from pydantic import BaseModel, EmailStr


class UsuarioCreate(BaseModel):
    nome: str
    cpf: str
    email: EmailStr
    senha: str
    endereco: str


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    tipo_usuario: str = "usuario"

    class Config:
        from_attributes = True
