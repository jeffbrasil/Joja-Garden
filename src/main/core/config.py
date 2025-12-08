# Aqui vamos colocar configurações e variáveis de ambiente global

import os


class Settings:
    PROJECT_NAME: str = "Joja Garden"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./banco.db")


settings = Settings()
