from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from main.core.config import settings
from main.db.session import SessionLocal
from main.models.user import Super_usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


# Esta aqui é uma dependência da sessão do BD
def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db

    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decodifica o token usando a chave secreta
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        cpf: str = payload.get("sub")
        if cpf is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(Super_usuario).filter(Super_usuario.cpf == cpf).first()
    if user is None:
        raise credentials_exception
    return user


# --- NOVA FUNÇÃO: Verifica se o usuário logado é ADMIN ---
def get_current_active_admin(current_user: Super_usuario = Depends(get_current_user)):
    # Aqui está a regra de negócio da PB03
    if current_user.type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem realizar esta ação.",
        )
    return current_user
