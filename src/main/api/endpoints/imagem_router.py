from fastapi import APIRouter, Depends, HTTPException, status


from main.api.deps import get_current_user, get_db
from main.models.plant import PlantaUsuario
from main.models.imagem import Imagem

from main.schemas.imagem_schema import ImagemCreate, ImagemResponse
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/{planta_id}/adicionar", status_code= status.HTTP_201_CREATED, response_model= ImagemResponse)
def adicionar_imagem_planta(
    planta_id :int,
     imagem_in : ImagemCreate,
    current_user = Depends(get_current_user),
    session = Depends(get_db)   
    ):


    if not session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_id).first():
        raise HTTPException(status_code= 404, detail = "Planta não encontrada")
    if not session.query(PlantaUsuario).filter(PlantaUsuario.usuario_id == current_user.id).first():
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail = "Usuario não encontrado")
    
    nova_imagem = Imagem(
        descricao = imagem_in.descricao,
        data_hora = imagem_in.data_hora if imagem_in.data_hora else datetime.now(),
        titulo = imagem_in.titulo,
        url = imagem_in.url,
        planta_id = planta_id
    )

    session.add(nova_imagem)
    session.commit()
    session.refresh(nova_imagem)

    return nova_imagem

@router.get(
    "/{planta_id}/galeria",
    response_model= List[ImagemResponse]
)
def ver_galeria(
    planta_id: int,
    current_user = Depends(get_current_user),
    session = Depends(get_db)
):
    if not session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_id).first():
        raise HTTPException(status_code= 404, detail = "Planta não encontrada")
    if not session.query(PlantaUsuario).filter(PlantaUsuario.usuario_id == current_user.id).first():
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail = "Usuario não encontrado")
    
    galeria = session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_id).first().galeria

    return galeria
# ... (imports e outras rotas)

@router.delete("/imagem/{imagem_id}", status_code=status.HTTP_200_OK)
def deletar_imagem_planta(
    imagem_id: int,
    current_user = Depends(get_current_user), # O Usuário logado
    session = Depends(get_db)
):
    
    imagem_a_deletar = session.query(Imagem).filter(Imagem.id == imagem_id).first()
    
    if not imagem_a_deletar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Imagem com ID {imagem_id} não encontrada."
        )

    planta_dona = (
        session.query(PlantaUsuario)
        .filter(PlantaUsuario.id == imagem_a_deletar.planta_id, PlantaUsuario.usuario_id == current_user.id)
        .first()
    )
    
    if not planta_dona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="A imagem não existe ou não pertence a uma de suas plantas."
        )
        
    titulo_imagem = imagem_a_deletar.titulo or "Sem Título"
    
    session.delete(imagem_a_deletar)
    session.commit()
    
    return {
        "message": f"A imagem {titulo_imagem} foi deletada com sucesso."
    }