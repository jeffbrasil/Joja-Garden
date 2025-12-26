
from typing import Optional, List

from pydantic import BaseModel,ConfigDict
from main.schemas.planta_catalogo_schema import PlantaUsuarioResponse

class JardimBase(BaseModel):
    nome: str

class JardimCreate(JardimBase):
    pass
class JardimResponse(JardimBase):
    id: int
    plantas : List[PlantaUsuarioResponse] = []

    model_config=ConfigDict(from_attributes=True)