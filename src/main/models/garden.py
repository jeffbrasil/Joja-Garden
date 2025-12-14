from sqlalchemy import (
    Boolean,
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import relationship

from main.db.base_class import Base


class Jardim(Base):
    __tablename__ = "jardim"

    id = Column("id", Integer,primary_key=True, autoincrement = True)
    nome = Column("nome", String, default = "")
    usuario_id = Column(Integer, ForeignKey("usuario.id"))
    dono = relationship("Usuario", back_populates="jardim")

    plantas = relationship("PlantaUsuario", back_populates="jardim")