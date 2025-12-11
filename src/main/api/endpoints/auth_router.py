from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from main.api.deps import get_db
from main.core.config import settings
from main.core.security import create_access_token, verify_password
from main.db.session import SessionLocal
from main.models.user import Super_usuario

router = APIRouter()


@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    # 1. Buscar o usuário pelo CPF (O FastAPI usa 'username' no form padrão, mas nós vamos passar o CPF)
    user = (
        db.query(Super_usuario).filter(Super_usuario.cpf == form_data.username).first()
    )

    # 2. Verificar se usuário existe e se a senha bate
    if not user or not verify_password(form_data.password, user.hash_senha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="CPF ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Gerar o tempo de vida do token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # 4. Criar o token contendo o ID e o TIPO do usuário (Admin ou Cliente)
    access_token = create_access_token(
        data={"sub": user.cpf, "tipo": user.type, "id": user.id},
        expires_delta=access_token_expires,
    )

    # 5. Retornar o token
    return {"access_token": access_token, "token_type": "bearer"}
