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

class Imagem(Base):
    __tablename__ = "imagem"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    descricao = Column("descricao", String, nullable=True)
    data_hora = Column(DateTime, default = datetime.now())
    titulo = Column(String, default="")
    url = Column("url", String, nullable=False)
    planta_id = Column(Integer, ForeignKey("planta_usuario.id"), nullable = False)

    planta = relationship("PlantaUsuario", back_populates="galeria")