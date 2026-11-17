from typing import Annotated

from pydantic import EmailStr, SecretStr, StringConstraints, field_validator
from sqlmodel import Field, SQLModel

Nombre = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=100, pattern=r"^[^\x00]*$"),
]


class UserCreate(SQLModel):
    username: Nombre
    full_name: Nombre
    email: EmailStr
    password: SecretStr = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def validar_password(cls, password: SecretStr) -> SecretStr:
        value = password.get_secret_value()
        if len(value.encode("utf-8")) > 72 or "\x00" in value:
            raise ValueError(
                "La contraseña debe ocupar hasta 72 bytes y no contener caracteres nulos."
            )
        return password


class Mensaje(SQLModel):
    message: str
