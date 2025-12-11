from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from main.api.deps import get_db
from main.core.security import get_password_hash
from main.models.user import Admin, Super_usuario
from main.schemas.admin_schema import AdminCreate, AdminResponse

router = APIRouter()


@router.post(
    "/criar_conta", response_model=AdminResponse, status_code=status.HTTP_201_CREATED
)
def create_admin(admin_in: AdminCreate, session=Depends(get_db)):

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
def read_admin(admin_in: int, session=Depends(get_db)):

    admin = session.query(Admin).filter(Admin.id == admin_in).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Administrador não encontrado")
    return admin
