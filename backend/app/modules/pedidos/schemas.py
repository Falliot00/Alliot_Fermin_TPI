from typing import Annotated

from pydantic import Field, StringConstraints
from sqlmodel import SQLModel

from app.core.schema import FechaUtc, Texto

from .models import EstadoPedido, FormaPago

Direccion = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=5, max_length=200, pattern=r"^[^\x00]*$"),
]


class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1, le=2_147_483_647, strict=True)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: Direccion
    notas: Texto | None = None


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: FechaUtc
    updated_at: FechaUtc
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
