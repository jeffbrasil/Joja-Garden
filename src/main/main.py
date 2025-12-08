from fastapi import FastAPI


app = FastAPI()

from .api.endpoints import admin_router

app.include_router(admin_router.router, prefix="/admin", tags=["Admins"])
# Para executar o código no terminal, utilizar unicorn main:app --reload
