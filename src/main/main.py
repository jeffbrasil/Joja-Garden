from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "https://joja-garden.vercel.app"
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .api.endpoints import (
    acao_router,
    admin_router,
    auth_router,
    catalogo_router,
    imagem_router,
    jardim_router,
    planta_router,
    usuario_router,
)

app.include_router(admin_router.router, prefix="/admin", tags=["Admins"])

app.include_router(auth_router.router, prefix="/auth", tags=["Autenticação"])

app.include_router(usuario_router.router, prefix="/usuario", tags=["Usuario"])

app.include_router(planta_router.router, prefix="/planta", tags=["Planta"])

app.include_router(catalogo_router.router, prefix="/catalogo", tags=["Catalogo"])

app.include_router(jardim_router.router, prefix="/jardim", tags=["Jardim"])

app.include_router(acao_router.router, prefix="/acao", tags=["Acao"])

app.include_router(imagem_router.router, prefix="/imagem", tags=["Imagem"])
# Para executar o código no terminal, utilizar uvicorn main:app --reload
