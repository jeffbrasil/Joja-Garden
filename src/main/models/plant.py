from datetime import date

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


class PlantaCatalogo(Base):
    __tablename__ = "planta_catalogo"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    nome = Column("apelido", String, default="")
    nome_cientifico = Column("nome_cientifico", String)
    categoria = Column("categoria", String)
    familia = Column("familia", String)
    descricao = Column("descricao", Text)
    instrucoes_cuidado = Column("instrucoes_Cuidado", Text, nullable=True)
    img_url = Column("imagem", String)
    periodicidade_rega = Column(Integer, default=2)
    periodicidade_poda = Column(Integer, default=30)
    periodicidade_adubo = Column(Integer, default=15)

    # Valores default arbitrarios para os itens acima


class PlantaUsuario(Base):

    __tablename__ = "planta_usuario"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    apelido = Column("apelido", String, default="")
    data_plantio = Column("data_plantio", Date, default=date.today)

    usuario_id = Column("usuario", Integer, ForeignKey("usuario.id"))
    planta = Column("planta", Integer, ForeignKey("planta_catalogo.id"))
    # Aqui o sqlalchemy traz automaticamente todas as informações quando o usuario digitar "minhaPlanta.catalogo"
    catalogo = relationship("PlantaCatalogo")
    # Aqui a mesma coisa, ele traz o usuario quando tivermos minhaPlanta.dono
    dono = relationship("Usuario", backref="minhas_plantas")
