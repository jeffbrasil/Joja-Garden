from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from main.api.deps import get_db, get_current_active_admin
from main.core.security import get_password_hash, verify_password
from main.models.user import Admin, Super_usuario
from main.schemas.admin_schema import AdminCreate, AdminResponse
from main.schemas.alterar_senha_schema import AlterarSenha
from main.schemas.esqueceu_senha_schema import EsqueceuSenha
from services.verificacoes import valida_cpf, valida_senha

router = APIRouter()


@router.post(
    "/criar_conta", response_model=AdminResponse, status_code=status.HTTP_201_CREATED
)
def create_admin(admin_in: AdminCreate, session=Depends(get_db)):

    if not valida_cpf(admin_in.cpf):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF inválido"
        )

    
    if not valida_senha(admin_in.senha):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha inválida"
        )

    user_existente = (
        session.query(Super_usuario).filter(Super_usuario.cpf == admin_in.cpf).first()
    )
    if user_existente:
        raise HTTPException(
            status_code=400, detail="Já existe um usuário cadastrado com esse CPF."
        )

    novo_admin = Admin(
        nome=admin_in.nome,
        cpf=admin_in.cpf,
        hash_senha=get_password_hash(admin_in.senha),
    )
    session.add(novo_admin)
    session.commit()
    session.refresh(novo_admin)
    novo_admin.tipo_usuario = "admin"
    return novo_admin


@router.get("/{admin_id}", response_model=AdminResponse)
def read_admin(admin_id: int, session=Depends(get_db)):

    admin = session.query(Admin).filter(Admin.id == admin_id).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Administrador não encontrado")
    return admin

@router.put("/{admin_id}/alterar-senha", status_code = status.HTTP_200_OK)
def alterar_senha(
    dados : AlterarSenha,
    current_admin = Depends(get_current_active_admin),
    session = Depends(get_db)
):
    #verifica se a senha atual está correta
    if not verify_password(dados.senha_atual, current_admin.hash_senha):
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = "A senha atual está incorreta")
    
    #verifica se a nova senha é igual a atuaç
    if verify_password(dados.nova_senha,current_admin.hash_senha):
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = "A nova senha deve ser diferente da atual")
    
    #verifica se a nova senha é uma senha válida.
    if not valida_senha(dados.nova_senha):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha inválida"
        )

    current_admin.hash_senha = get_password_hash(dados.nova_senha)

    session.add(current_admin)
    session.commit()

    return {"msg" : "A senha foi alterada com sucesso."}

@router.put("/alterar-minha-senha", status_code=status.HTTP_200_OK)
def admin_alterar_minha_senha(
    senha_in: EsqueceuSenha, 
    current_admin: Super_usuario = Depends(get_current_active_admin), 
    session = Depends(get_db)
):

    if not valida_senha(senha_in.nova_senha):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Senha inválida"
        )
    
    # 2. Altera a senha do Admin logado
    current_admin.hash_senha = get_password_hash(senha_in.nova_senha)
    
    session.add(current_admin)
    session.commit()

    return {"msg": "Sua senha de Administrador foi alterada com sucesso."}

# ... (imports no topo do arquivo)
from main.models.user import Super_usuario # Garanta que este modelo esteja importado


@router.delete("/{admin_id}", status_code=status.HTTP_200_OK)
def delete_admin(
    admin_id: int,
    session: Session = Depends(get_db),
    current_admin: Super_usuario = Depends(get_current_active_admin), 
):
  
    
    admin_a_deletar = session.query(Super_usuario).filter(Super_usuario.id == admin_id).first()

    if not admin_a_deletar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Administrador com ID {admin_id} não encontrado."
        )
    
    if admin_a_deletar.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é permitido que um administrador se auto-delete."
        )

    nome_admin_deletado = admin_a_deletar.nome or admin_a_deletar.email
    
    session.delete(admin_a_deletar)
    session.commit()
    
    return {
        "message": f"Administrador {nome_admin_deletado} foi deletado por outro Administrador."
    }