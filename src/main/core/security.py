from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import jwt

from main.core.config import settings

# Não usamos mais o CryptContext do passlib


def get_password_hash(password: str) -> str:
    """
    Recebe uma senha em texto (ex: '123456')
    Retorna o hash em string para salvar no banco.
    """
    # 1. Converter string para bytes
    pwd_bytes = password.encode("utf-8")

    # 2. Gerar o salt
    salt = bcrypt.gensalt()

    # 3. Gerar o hash
    hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)

    # 4. Converter de volta para string para salvar no Banco de Dados
    return hashed_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compara a senha em texto plano com o hash do banco.
    """
    # 1. Converter a senha recebida para bytes
    pwd_bytes = plain_password.encode("utf-8")

    # 2. Converter o hash do banco para bytes (caso venha como string)
    hash_bytes = hashed_password.encode("utf-8")

    # 3. Verificar
    return bcrypt.checkpw(pwd_bytes, hash_bytes)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt
