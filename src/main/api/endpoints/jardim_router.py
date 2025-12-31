from fastapi import APIRouter, Depends, HTTPException, status


from main.api.deps import get_current_user, get_db
from main.models.plant import PlantaUsuario
from main.models.jardim import Jardim
from main.models.user import Usuario

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

@router.delete("/{jardim_id}")
def remover_jardim(
    jardim_id : int,
    current_user = Depends(get_current_user),
    session = Depends(get_db)
):
    #verifica se o jardim é do usuário

    jardim = session.query(Jardim).filter(Jardim.id == jardim_id, Jardim.usuario_id == current_user.id).first()

    if not jardim:
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = "Jardim não encontrado")
    #verificar se o jardim está vazio

    tem_planta = session.query(PlantaUsuario).filter(PlantaUsuario.jardim_id == jardim_id).first()
    
    if tem_planta:
        raise HTTPException(status_code = status.HTTP_409_CONFLICT, detail = "O jardim precisa estar sem plantas para ser excluido")

    session.delete(jardim)
    session.commit()

    return {"msg" : "Jardim excluído com sucesso"}
