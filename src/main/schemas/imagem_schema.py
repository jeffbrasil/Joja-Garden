from typing import Optional

from pydantic import BaseModel,ConfigDict
from main.schemas.planta_catalogo_schema import PlantaUsuarioResponse
from main.models.acao_tipo import TipoAcao
from datetime import datetime

class ImagemBase(BaseModel):
    descricao : Optional[str] = None
    titulo : Optional[str] = None
    url : str
    
class ImagemCreate(ImagemBase):
    pass
class ImagemResponse(ImagemBase):
    id : int
    data_hora: datetime

    model_config = ConfigDict(from_attributes= True)