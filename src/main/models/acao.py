from main.models.acao_tipo import TipoAcao
from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    Enum,
    DateTime
    
)

from main.db.base_class import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class Acao(Base):
    __tablename__ = "acao"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    tipo = Column(Enum(TipoAcao), nullable=False)
    data_hora = Column(DateTime, default=datetime.now)
    descricao = Column("descricao", String, nullable=True)
    planta_id = Column(Integer, ForeignKey("planta_usuario.id"),nullable=False)
    planta = relationship("PlantaUsuario", back_populates= "historico")
