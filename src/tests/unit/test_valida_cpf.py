from services.verificacoes import valida_cpf

import pytest
@pytest.mark.parametrize(
        "cpf", [
            '0000000000',
            '0866743138a',
            'asdasdasdsadasdasd',
            '0976545678',
            '',
        ]
)

def testa_cpf_invalido(cpf):
    assert valida_cpf(cpf) is False
@pytest.mark.parametrize(
        "cpf", [
            '46632770045',
            '04148095058',
            '93128492042',
            '78310556063',
            '15957275077',
        ]
)

def testa_cpf_valido(cpf):
    assert valida_cpf(cpf) is True

