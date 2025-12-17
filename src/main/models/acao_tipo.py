import enum

class TipoAcao(str, enum.Enum):
    REGA = "rega",
    PODA = "poda",
    ADUBO = "adubo",
    OUTOR = "outro",