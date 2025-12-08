from datetime import date
from typing import Optional

from pydantic import BaseModel


class PlantaCatalogoBase(BaseModel):
    nome: str
    nome_cientifico: Optional[str] = None
    categoria: Optional[str] = None
    familia: Optional[str] = None
    descricao: Optional[str] = None
    instrucoes_cuidado: Optional[str] = None
    img_url: Optional[str] = None
    periodicidade_rega: int = 2
    periodicidade_poda: int = 30
    periodicidade_adubo: int = 15


# O admin utiliza este para adicionar uma planta no catálogo
class PlantaCatalogoCreate(PlantaCatalogoBase):
    pass


class PlantaCatalogoResponse(PlantaCatalogoBase):
    id: int

    class Config:
        from_attributes = True


class PlantaUsuarioCreate(BaseModel):
    id_planta_catalogo: int
    apelido: Optional[str] = None
    data_plantio: Optional[date] = None


class PlantaUsuarioResponse(BaseModel):
    id: int
    apelido: Optional[str]

    catalogo: PlantaCatalogoResponse

    class Config:
        from_attributes = True
