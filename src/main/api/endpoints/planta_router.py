from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from main.api.deps import get_current_active_admin, get_db, get_current_user
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
    if not session.query(Usuario).filter(Usuario.id == usuario_id).first():
        raise HTTPException(status_code=400, detail="Usuário não existe")

    if (
        not session.query(PlantaCatalogo)
        .filter(PlantaCatalogo.id == planta_in.id)
        .first()
    ):
        raise HTTPException(status_code=400, detail="Planta não cadastrada no sistema")

    nova_planta_usuario = PlantaUsuario(
        usuario_id=usuario_id,
        planta=planta_in.id,
        apelido=planta_in.apelido,
    )
    session.add(nova_planta_usuario)
    session.commit()
    session.refresh(nova_planta_usuario)

    return nova_planta_usuario

@router.get(
    "/{planta_id}",
    response_model = PlantaUsuarioResponse,
    status_code = status.HTTP_200_OK
)
def visualizar_minha_planta(
    planta_id: int,
    current_user = Depends(get_current_user),
    session = Depends(get_db)
):
    
    planta = session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_id, PlantaUsuario.usuario_id == current_user.id).first()

    if not planta:
        raise HTTPException(status_code = 400, detail = "Planta não encontrada")
    
    return planta

@router.delete("/{planta_id}", status_code = status.HTTP_204_NO_CONTENT)
def remover_minha_planta(
    planta_id : int,
    current_user = Depends(get_current_user),
    session = Depends(get_db)
):
    #Verifica se a planta que o usuário quer deletar é dele mesmo

    planta = session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_id, PlantaUsuario.usuario_id == current_user.id).first()

    if not planta:
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = "Planta não encontrada")
    
    session.delete(planta)
    session.commit()

    return {"msg" : "Planta Excluída com sucesso"}
    