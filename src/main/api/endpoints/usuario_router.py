from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from main.api.deps import get_current_active_admin, get_db  # <--- Importante
from main.core.security import get_password_hash
from main.models.user import Super_usuario, Usuario
from main.schemas.usuario_schema import UsuarioCreate, UsuarioResponse
from services.verificacoes import valida_cpf, valida_senha

router = APIRouter()


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def create_usuario(
    usuario_in: UsuarioCreate,
    session=Depends(get_db),
    current_admin=Depends(get_current_active_admin),
):
    
    if not valida_cpf(usuario_in.cpf):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF inválido"
        )

    
    if not valida_senha(usuario_in.senha):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha inválida"
        )

    # verifica se o CPF existe
    if session.query(Super_usuario).filter(Super_usuario.cpf == usuario_in.cpf).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado")

    # verifica se o email já está cadastrado
    if session.query(Usuario).filter(Usuario.email == usuario_in.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    novo_usuario = Usuario(
        nome=usuario_in.nome,
        cpf=usuario_in.cpf,
        email=usuario_in.email,
        hash_senha=get_password_hash(usuario_in.senha),
    )
    session.add(novo_usuario)
    session.commit()
    session.refresh(novo_usuario)
    novo_usuario.tipo_usuario = "usuario"
    return novo_usuario
