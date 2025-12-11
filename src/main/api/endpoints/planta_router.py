from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from main.api.deps import get_current_active_admin, get_db
from main.models.plant import PlantaCatalogo, PlantaUsuario
from main.models.user import Usuario, Admin
from main.schemas.planta_catalogo_schema import (
    PlantaCatalogoCreate,
    PlantaCatalogoResponse,
    PlantaUsuarioCreate,
    PlantaUsuarioResponse,
)

router = APIRouter()


@router.post(
    "/usuario/{usuario_id}/adicionar",
    response_model=PlantaUsuarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def adicionar_planta_ao_usuario(
    usuario_id: int,
    planta_in: PlantaUsuarioCreate,
    session=Depends(get_db),
    current_admin=Depends(get_current_active_admin),
):
    if not session.query(Admin).filter(Admin.id == usuario_id).first():
        raise HTTPException(status_code=400, detail="Usuário não existe")

    if (
        not session.query(PlantaCatalogo)
        .filter(PlantaCatalogo.id == planta_in.id)
        .first()
    ):
        raise HTTPException(status_code=400, detail="Planta não cadastrada no sistema")

    nova_planta_usuario = PlantaUsuario(
        usuaio_id=usuario_id,
        catalogo_id=planta_in.id,
        apelido=planta_in.apelido,
    )
    session.add(nova_planta_usuario)
    session.commit()
    session.refresh(nova_planta_usuario)

    return nova_planta_usuario
