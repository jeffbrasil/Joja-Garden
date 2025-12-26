from fastapi import APIRouter, Depends, HTTPException, status

from main.api.deps import get_current_active_admin, get_current_user, get_db
from main.models.plant import PlantaCatalogo
from main.schemas.planta_catalogo_schema import (
    PlantaCatalogoBase,
    PlantaCatalogoCreate,
    PlantaCatalogoResponse,
)

from typing import List
router = APIRouter()


@router.post(
    "/adicionar_planta_catalogo",
    response_model=PlantaCatalogoResponse,
    status_code=status.HTTP_201_CREATED,
)
def adicionar_planta_ao_catalogo(
    planta_in: PlantaCatalogoCreate,
    session=Depends(get_db),
    current_admin=Depends(get_current_active_admin),
):
    # verificar se a planta já não está cadastrada
    if (
         session.query(PlantaCatalogo)
        .filter(PlantaCatalogo.nome_cientifico == planta_in.nome_cientifico)
        .first()
    ):
        raise HTTPException(
            status_code=400, detail="Já existe uma planta com o mesmo nome científico"
        )
    nova_planta_catalogo = PlantaCatalogo(
        nome=planta_in.nome,
        nome_cientifico=planta_in.nome_cientifico,
        categoria=planta_in.categoria,
        familia=planta_in.familia,
        descricao=planta_in.descricao,
        instrucoes_cuidado=planta_in.instrucoes_cuidado,
        img_url=planta_in.img_url,
        periodicidade_rega=planta_in.periodicidade_rega,
        periodicidade_poda=planta_in.periodicidade_poda,
        periodicidade_adubo=planta_in.periodicidade_adubo,
    )
    session.add(nova_planta_catalogo)
    session.commit()
    session.refresh(nova_planta_catalogo)

    return nova_planta_catalogo


@router.get(
    "/visualizar",
    response_model= List[PlantaCatalogoResponse],
    status_code=status.HTTP_200_OK,
)
def listar_catalogo(
    skip: int = 0,
    limit:int = 25, 
    session=Depends(get_db),
    current_user=Depends(get_current_user),
):

    catalogo = session.query(PlantaCatalogo).offset(skip).limit(limit).all()
    return catalogo
