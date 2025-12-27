from typing import Optional

from pydantic import BaseModel,ConfigDict
from main.schemas.planta_catalogo_schema import PlantaUsuarioResponse
from main.models.acao_tipo import TipoAcao
from datetime import datetime

class AcaoBase(BaseModel):
    tipo : TipoAcao
    descricao : Optional[str]
    data_hora : Optional[datetime] = None

class AcaoCreate(AcaoBase):
    pass

class AcaoResponse(AcaoBase):
    id : int
    data_hora : datetime
    
    model_config = ConfigDict(from_attributes=True)