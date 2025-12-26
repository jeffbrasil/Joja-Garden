import pytest
from services.verificacoes import valida_senha

@pytest.mark.parametrize(
    "senha", [
        "abc",                  
        "abcdefg",             
        "abcdefgh",             
        "abcdefg1",             
        "ABCDEFGH",             
        "Abcdefg ",             
        "Abcdefgh",            
        "12345678",             
        "",                     
    ]
)
def testa_senha_invalida(senha):
    assert valida_senha(senha) is False

@pytest.mark.parametrize(
    "senha", [
        "Abcdefg1",
        "Senha123",
        "Python9A",
        "XyZ12345",
        "A1b2c3d4",
    ]
)
def testa_senha_valida(senha):
    assert valida_senha(senha) is True
