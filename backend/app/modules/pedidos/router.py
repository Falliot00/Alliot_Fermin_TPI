from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import ActiveUser, AdminUser
from app.modules.productos.service import ProductoNoEncontrado

from .models import EstadoPedido
from .schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .service import PedidoAjeno, PedidoNoEncontrado, PedidoService, ReglaPedido
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])
pedido_404 = {404: {"description": "Pedido no encontrado"}}


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


PedidoDep = Annotated[PedidoService, Depends(get_pedido_service)]


@router.post(
    "",
    status_code=201,
    responses={
        400: {"description": "Pedido inválido"},
        404: {"description": "Producto no encontrado"},
    },
)
def crear(data: PedidoCreate, usuario: ActiveUser, service: PedidoDep) -> PedidoRead:
    try:
        return service.crear(data, usuario)
    except ProductoNoEncontrado as error:
        raise HTTPException(404, str(error)) from error
    except ReglaPedido as error:
        raise HTTPException(400, str(error)) from error


@router.get("")
def listar(
    usuario: ActiveUser,
    service: PedidoDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(usuario, estado, skip, limit)


@router.get("/resumen")
def resumen(_admin: AdminUser, service: PedidoDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{id}", responses={**pedido_404, 403: {"description": "Pedido de otro usuario"}})
def obtener(id: int, usuario: ActiveUser, service: PedidoDep) -> PedidoRead:
    try:
        return service.obtener(id, usuario)
    except PedidoAjeno as error:
        raise HTTPException(403, str(error)) from error
    except PedidoNoEncontrado as error:
        raise HTTPException(404, str(error)) from error


@router.patch("/{id}/estado", responses={**pedido_404, 400: {"description": "Transición inválida"}})
def cambiar_estado(
    id: int, data: CambioEstado, _admin: AdminUser, service: PedidoDep
) -> PedidoRead:
    try:
        return service.cambiar_estado(id, data.estado)
    except PedidoNoEncontrado as error:
        raise HTTPException(404, str(error)) from error
    except ReglaPedido as error:
        raise HTTPException(400, str(error)) from error


@router.patch(
    "/{id}/cancelar",
    responses={
        **pedido_404,
        400: {"description": "Pedido fuera de PENDIENTE"},
        403: {"description": "Pedido de otro usuario"},
    },
)
def cancelar(id: int, usuario: ActiveUser, service: PedidoDep) -> PedidoRead:
    try:
        return service.cancelar_propio(id, usuario)
    except PedidoAjeno as error:
        raise HTTPException(403, str(error)) from error
    except PedidoNoEncontrado as error:
        raise HTTPException(404, str(error)) from error
    except ReglaPedido as error:
        raise HTTPException(400, str(error)) from error
