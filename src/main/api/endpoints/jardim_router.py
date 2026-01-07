from fastapi import APIRouter, Depends, HTTPException, status


from main.api.deps import get_current_user, get_db
from main.models.plant import PlantaUsuario
from main.models.jardim import Jardim
from main.models.user import Usuario
from sqlalchemy.orm import Session
from typing import List

from main.schemas.jardim_schema import JardimCreate, JardimResponse

router = APIRouter()

@router.post(
    "/criar_jardim",
    response_model = JardimResponse,
    status_code= status.HTTP_201_CREATED,
)
def criar_jardim(
    jardim_in : JardimCreate,
    session = Depends(get_db),
    current_usuario = Depends(get_current_user)
):
    if session.query(Jardim).filter(Jardim.nome == jardim_in.nome).first():
        raise HTTPException(status_code= 400, detail = "Já existe um jardim com esse nome")

    novo_jardim = Jardim(
        nome = jardim_in.nome,
        usuario_id = current_usuario.id
    )

    session.add(novo_jardim)
    session.commit()
    session.refresh(novo_jardim)

    return novo_jardim

@router.post(
    "/{jardim_id}/adicionar-planta/{planta_id}"
)
def adicionar_planta_jardim(
    planta_id : int,
    jardim_id : int,
    session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    #verifica se a planta já não está no jardim
    if  session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_id, PlantaUsuario.jardim_id == jardim_id).first():
        raise HTTPException(status_code=400, detail = "A planta atual já pertence ao jardim")
    #verifica se o jardim é do usuario
    jardim = session.query(Jardim).filter(Jardim.id == jardim_id, Jardim.usuario_id == current_user.id).first()
    if not jardim:
        raise HTTPException(status_code= 404, detail= "Jardim não encontrado")
    
    #verifica se o usuário possui a planta
    planta = session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_id,PlantaUsuario.usuario_id == current_user.id).first()

    if not planta:
        raise HTTPException( status_code = 404, detail = "Planta não encontrada no cadastro do usuário")
    
    planta.jardim_id = jardim_id
    
    session.commit()

    return {"message" : f"Planta {planta.apelido} foi adicionada ao jardim {jardim.nome}"}

@router.get(
    "/meus-jardins",
    response_model=List[JardimResponse], # Retorna uma lista de objetos JardimResponse
    status_code=status.HTTP_200_OK
)
def listar_meus_jardins(
    current_usuario: Usuario = Depends(get_current_user), # Obtém o usuário logado
    session: Session = Depends(get_db)
):
    """
    Lista todos os jardins que pertencem ao usuário autenticado.
    (Acesso apenas para o Usuário Logado)
    """
    
    jardins_do_usuario = (
        session.query(Jardim)
        .filter(Jardim.usuario_id == current_usuario.id)
        .all()
    )
    
    return jardins_do_usuario