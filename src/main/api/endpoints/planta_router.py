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
from typing import List

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
    "/minhas-plantas",
    response_model=List[PlantaUsuarioResponse], # Retorna uma lista de respostas
    status_code=status.HTTP_200_OK
)
def listar_minhas_plantas(
    current_user: Usuario = Depends(get_current_user), # Obtém o usuário logado
    session: Session = Depends(get_db)
):
    """
    Lista todas as plantas cadastradas que pertencem ao usuário autenticado.
    (Acesso apenas para o Usuário Logado)
    """
    
    plantas_do_usuario = (
        session.query(PlantaUsuario)
        .filter(PlantaUsuario.usuario_id == current_user.id)
        .all()
    )
    
    if not plantas_do_usuario:
        return []
    
    return plantas_do_usuario


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


@router.delete(
    "/{planta_id}", 
    status_code=status.HTTP_200_OK
)
def deletar_minha_planta(
    planta_id: int,
    current_user = Depends(get_current_user), 
    session = Depends(get_db)
):
    """
    Deleta uma planta do usuário logado pelo ID.
    (Acesso apenas para o Usuário Logado e apenas para suas próprias plantas)
    """
    
    planta_a_deletar = (
        session.query(PlantaUsuario)
        .filter(PlantaUsuario.id == planta_id, PlantaUsuario.usuario_id == current_user.id)
        .first()
    )

    # 2. Verifica se a planta existe e pertence ao usuário
    if not planta_a_deletar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Planta não encontrada ou não pertence a este usuário."
        )

    apelido_planta = planta_a_deletar.apelido
    

    session.delete(planta_a_deletar)
    session.commit()

    return {
        "message": f"A planta {apelido_planta} foi removida com sucesso de suas plantas."
    }




