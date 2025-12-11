# Aqui vamos colocar configurações e variáveis de ambiente global

import os


class Settings:
    PROJECT_NAME: str = "Joja Garden"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./banco.db")

    # Configurações referente ao token JWT
    # Gerei o secret key por meio do comando openssl rand -hex 32
    SECRET_KEY: str = "eb350f54b372a146ae63ea0060ffc28bdbaf3087f92928a99c6b6f20ef68b2d4"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30


settings = Settings()
