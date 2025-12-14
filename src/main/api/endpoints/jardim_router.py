from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from main.api.deps import get_current_user, get_db
from main.models.plant import PlantaCatalogo, PlantaUsuario
from main.models.garden import Jardim
from main.models.user import Usuario

from main.schemas.jardim_schema import (JardimCreate, JardimResponse)
router = APIRouter()

@router.post(
    "/criar_jardim",
    response_model = JardimResponse,
    status_code= status.HTTP_201_CREATED,
)
def criar_jardim(
    jardim_in = JardimCreate,
    session = Depends(get_db),
    current_usuario = Depends(get_current_user)
):
    if not session.query(Jardim).filter(Jardim.nome == jardim_in.nome).first():
        raise HTTPException(status_code= 400, detail = "Já existe um jardim com esse nome")

    novo_jardim = Jardim(
        nome = jardim_in.nome,
        usuario_id = current_usuario
    )

    session.add(novo_jardim)
    session.commit()
    session.refresh(novo_jardim)

    return novo_jardim

@router.post(
    "/{jardim_id}/adicionar-planta/{planta_id}"
)
def adicionar_planta_jardim(
    planta_in : int,
    jardim_id : int,
    session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    #verifica se a planta já não está no jardim
    if not session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_in).first():
        raise HTTPException(status_code=400, detail = "A planta atual já pertence ao jardim")
    #verifica se o jardim é do usuario
    jardim = session.query(Usuario).filter(Usuario.jardins)