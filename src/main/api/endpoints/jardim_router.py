from fastapi import APIRouter, Depends, HTTPException, status


from main.api.deps import get_current_user, get_db
from main.models.plant import PlantaUsuario
from main.models.jardim import Jardim
from main.models.user import Usuario
from sqlalchemy.orm import Session
from typing import List

from main.schemas.jardim_schema import JardimCreate, JardimResponse
from main.schemas.planta_movimentacao_schema import MoverPlanta
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

@router.put("/{planta_id}/mover-planta")
def mover_planta_de_jardim(
    planta_id : int,
    dados_movimentacao : MoverPlanta,
    
    current_user = Depends(get_current_user),
    session = Depends(get_db)
):

    
    jardim_novo = session.query(Jardim).filter(Jardim.id == dados_movimentacao.jardim_novo, Jardim.usuario_id == current_user.id).first()
    #verifica se o jardim de destino existe e percente ao usuário
    if not jardim_novo:
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = "Jardim novo não encontrado")

    planta = session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_id, PlantaUsuario.usuario_id == current_user.id).first()

    #verifica se a planta existe e pertence ao jardim indicado
    if not planta:
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = "Planta não pertence ao usuário ou não pertence ao jardim")
    #movimenta a planta de jardim
    planta.jardim_id = dados_movimentacao.jardim_novo
    session.add(planta)
    session.commit()
    session.refresh(planta)
    #commita as mudanças no banco
    return {"msg" : "Planta movida com sucesso"}

@router.put("/{jardim_id}/renomear")
def renomear_jardim(
    jardim_id : int,
    novo_nome : str,
    current_user = Depends(get_current_user),
    session = Depends(get_db)
):
    
    jardim = session.query(Jardim).filter(Jardim.id == jardim_id, Jardim.usuario_id == current_user.id).first()

    if not jardim:
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = "Jardim não encontrado")
    
    if jardim.nome == novo_nome:
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST, detail = "Jardim já possui este nome")    
    
    jardim.nome = novo_nome
    
    session.add(jardim)
    session.commit()
    session.refresh(jardim)

    return {"msg" : "Nome do jardim alterado com sucesso."}