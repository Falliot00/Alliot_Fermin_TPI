from typing import Annotated

from pydantic import Field, HttpUrl, StringConstraints, field_validator
from sqlmodel import SQLModel

from app.core.schema import Texto
from app.modules.categorias.schemas import CategoriaRead

NombreProducto = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, pattern=r"^[^\x00]*$")
]
Precio = Annotated[float, Field(ge=0, allow_inf_nan=False)]
Stock = Annotated[int, Field(ge=0, le=9_007_199_254_740_991, strict=True)]
CategoriaId = Annotated[int, Field(gt=0)]


class ProductoCreate(SQLModel):
    categoria_id: CategoriaId
    nombre: NombreProducto
    descripcion: Texto | None = None
    precio_base: Precio
    imagen_url: str | None = None
    stock: Stock = 0
    disponible: bool = True

    @field_validator("imagen_url")
    @classmethod
    def validar_imagen(cls, value: str | None) -> str | None:
        return str(HttpUrl(value)) if value is not None else None


class ProductoUpdate(SQLModel):
    categoria_id: CategoriaId | None = None
    nombre: NombreProducto | None = None
    descripcion: Texto | None = None
    precio_base: Precio | None = None
    imagen_url: str | None = None
    stock: Stock | None = None
    disponible: bool | None = None

    @field_validator("categoria_id", "nombre", "precio_base", "stock", "disponible")
    @classmethod
    def rechazar_nulo(cls, value):
        if value is None:
            raise ValueError("Este campo no puede ser nulo.")
        return value

    @field_validator("imagen_url")
    @classmethod
    def validar_imagen(cls, value: str | None) -> str | None:
        return ProductoCreate.validar_imagen(value)


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead


class ProductoStockUpdate(SQLModel):
    stock: Stock
    disponible: bool


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
