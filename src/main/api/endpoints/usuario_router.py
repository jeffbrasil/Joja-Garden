from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from main.api.deps import get_current_active_admin, get_db, get_current_user  # <--- Importante
from main.core.security import get_password_hash, verify_password
from main.models.user import Super_usuario, Usuario
from main.schemas.usuario_schema import UsuarioCreate, UsuarioResponse
from main.schemas.alterar_senha_schema import AlterarSenha
from services.verificacoes import valida_cpf, valida_senha
from typing import List

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

@router.get("/dados", response_model = UsuarioResponse, status_code = status.HTTP_200_OK)
def ler_usuario_cpf(
    cpf : str,
    current_admin = Depends(get_current_active_admin),
    session = Depends(get_db)):

    usuario = session.query(Usuario).filter(Usuario.cpf == cpf).first()
    if not usuario:
        raise HTTPException(status_code = 400, detail = "Usuario não encontrado")
    return usuario

@router.get(f"/dados-cadastrais", response_model = UsuarioResponse, status_code = status.HTTP_200_OK)

def meus_dados(
    current_user = Depends(get_current_user)
    
):

    return current_user


@router.get("/all", response_model=List[UsuarioResponse], status_code=status.HTTP_200_OK)
def list_all_usuarios(
    session: Session = Depends(get_db),
    current_admin=Depends(get_current_active_admin), 
):
    """
    Lista todos os usuários cadastrados no banco de dados.
    (Exclusivo para Administradores)
    """
    # 1. Busca todos os usuários na tabela Usuario
    usuarios = session.query(Usuario).all()
    
    return usuarios

@router.put("/alterar-senha", status_code = status.HTTP_200_OK)
def alterar_senha(
    senha : AlterarSenha,
    current_user = Depends(get_current_user),
    session = Depends(get_db)
):
    #verifica a senha digitada correponde a atual
    if not verify_password(senha.senha_atual, current_user.hash_senha):
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail="A senha atual está incorreta")

    #verifica se a senha nova é igual a atual
    if verify_password(senha.nova_senha,current_user.hash_senha):
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = "A nova senha deve ser diferente da atual")
    
    if not valida_senha(senha.nova_senha):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha inválida"
        )
    
    current_user.hash_senha = get_password_hash(senha.nova_senha)
    
    session.add(current_user)
    session.commit()

    return {"msg" : "A senha foi alterada com sucesso"}


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_usuario(
    user_id: int,
    session: Session = Depends(get_db),
    current_admin: Super_usuario = Depends(get_current_active_admin), # Garante que apenas Admin possa deletar
):
    """
    Deleta um usuário do banco de dados (exclusivo para Administradores).
    """
    
    usuario_a_deletar = session.query(Usuario).filter(Usuario.id == user_id).first()

    if not usuario_a_deletar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Usuário com ID {user_id} não encontrado."
        )

    nome_usuario_deletado = usuario_a_deletar.nome

    session.delete(usuario_a_deletar)
    session.commit()
    
    return {
        "message": f"Usuário {nome_usuario_deletado} foi deletado."
    }


