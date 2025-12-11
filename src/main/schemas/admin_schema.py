from pydantic import BaseModel


class AdminBase(BaseModel):
    nome: str
    cpf: str


class AdminCreate(AdminBase):
    senha: str


class AdminResponse(AdminBase):
    id: int
    tipo_usuario: str = "admin"

    class Config:
        from_attributes = True
