from typing import Annotated

from pydantic import StringConstraints, field_validator
from sqlmodel import SQLModel

from app.core.schema import Texto

NombreCategoria = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=2, max_length=100, pattern=r"^[^\x00]*$"),
]


class CategoriaCreate(SQLModel):
    nombre: NombreCategoria
    descripcion: Texto | None = None


class CategoriaUpdate(SQLModel):
    nombre: NombreCategoria | None = None
    descripcion: Texto | None = None

    @field_validator("nombre")
    @classmethod
    def nombre_requerido(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("El nombre no puede ser nulo.")
        return value


class CategoriaRead(CategoriaCreate):
    id: int
    activo: bool
