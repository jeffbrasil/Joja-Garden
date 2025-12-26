
def valida_cpf(cpf):
    retorno = False
    # Remove caracteres não numéricos (como '.', '-')
    cpf = ''.join(filter(str.isdigit, cpf))

    if len(cpf) != 11:
        return retorno

    if cpf == cpf[0] * 11:
        return retorno

    def calcular_digito(cpf_parcial, peso):
        soma = 0
        for i in range(len(cpf_parcial)):
            soma += int(cpf_parcial[i]) * (peso - i)
        
        resto = soma % 11
        if resto < 2:
            return 0
        else:
            return 11 - resto

    primeiro_digito_calc = calcular_digito(cpf[:9], 10)
    segundo_digito_calc = calcular_digito(cpf[:10], 11)

    # Verifica se os dígitos calculados coincidem com os dígitos do CPF original
    if int(cpf[9]) == primeiro_digito_calc and int(cpf[10]) == segundo_digito_calc:
        retorno = True
        return retorno
    else:
        return retorno

def valida_senha(senha):
    retorno = False
    if len(senha) < 8:
        return retorno

    if " " in senha:
        return retorno

    tem_numero = False
    tem_maiuscula = False

    for caract in senha:
        if caract.isdigit():
            tem_numero = True
        if caract.isupper():
            tem_maiuscula = True

    return tem_numero and tem_maiuscula
