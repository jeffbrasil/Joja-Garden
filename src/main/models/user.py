from sqlalchemy import (
    Boolean,
    Column,
    Float,
    ForeignKey,
    Integer,
    String,
    create_engine,
)
from main.db.base_class import Base
# Cria a conexão com o banco

class Super_usuario(Base):
    __tablename__ = "super_usuario"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    nome = Column("nome", String, default="__")
    hash_senha = Column("senha", String, nullable=False)
    cpf = Column("cpf", String, nullable=False)
    type = Column(String)  # Aqui determinamos se é admin ou usuario

    __mapper_args__ = {"polymorphic_identity": "baser_user", "polymorphic_on": type}


class Admin(Super_usuario):
    __tablename__ = "admin"
    id = Column("id", Integer, ForeignKey("super_usuario.id"), primary_key=True)
    matricula = Column("matricula", String, default="")

    __mapper_args__ = {"polymorphic_identity": "admin"}


class Usuario(Base):

    __tablename__ = "usuario"
    id = Column("id", Integer, ForeignKey("super_usuario.id"), primary_key=True)
    email = Column("email", String, nullable=False)

    __mapper_args__ = {"polymorphic_identity": "usuario"}


# admin

# usuario
