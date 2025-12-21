from fastapi import APIRouter, Depends, HTTPException, status


from main.api.deps import get_current_user, get_db
from main.models.plant import PlantaUsuario
from main.models.acao import Acao

from main.schemas.acao_schema import AcaoCreate, AcaoResponse
from datetime import datetime
from typing import List

router = APIRouter()

@router.post(
    "/{planta_id}/registrar",
    response_model= AcaoResponse,
    status_code= status.HTTP_201_CREATED
)
def realizar_acao(
    planta_id: int,
    acao_in = AcaoCreate,
    session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_id).first():
        raise HTTPException(status_code= 404, detail = "Planta não encontrada")
   
    if not session.query(PlantaUsuario).filter(PlantaUsuario.usuario_id == current_user.id).first():
        raise HTTPException(status_code= 404, detail = "Planta não pertence a este usuário")
 
    nova_acao = Acao(
        tipo = acao_in.tipo,
        descricao = acao_in.descricao,
        data_hora = acao_in.data_hora if acao_in.data_hora else datetime.now(),
        planta_id = planta_id
    )

    session.add(nova_acao)
    session.commit()
    session.refresh(nova_acao)
    
    return nova_acao



@router.get(
    "/{planta_id}/acoes",
    response_model= List[AcaoResponse]
)
def listar_acoes(
    planta_id : int,
    current_user = Depends(get_current_user),
    session = Depends(get_db),
 
):
    if not session.query(PlantaUsuario).filter(PlantaUsuario.id == planta_id).first():
        raise HTTPException(status_code= 404, detail = "Planta não encontrada")
   
    if not session.query(PlantaUsuario).filter(PlantaUsuario.usuario_id == current_user.id).first():
        raise HTTPException(status_code= 404, detail = "Planta não pertence a este usuário")
    
    #A consulta retorna as ações na planta em ordem descendente
    acoes = session.query(Acao).filter(Acao.planta_id == planta_id).order_by(Acao.data_hora.desc()).all()

    return acoes

