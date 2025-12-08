from fastapi import FastAPI

app = FastAPI()

from .api.endpoints import admin_router, auth_router, planta_router, usuario_router

app.include_router(admin_router.router, prefix="/admin", tags=["Admins"])

app.include_router(auth_router.router, prefix="/auth", tags=["Autenticação"])

app.include_router(usuario_router.router, prefix="/usuario", tags=["Usuario"])

app.include_router(planta_router.router, prefix="/planta", tags=["Planta"])
# Para executar o código no terminal, utilizar unicorn main:app --reload
