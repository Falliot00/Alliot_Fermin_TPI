from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import AdminUser
from app.modules.categorias.service import CategoriaNoEncontrada

from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .service import ProductoNoEncontrado, ProductoService
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])
producto_404 = {404: {"description": "Producto no encontrado"}}


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ProductoDep = Annotated[ProductoService, Depends(get_producto_service)]


@router.get("")
def listar(
    service: ProductoDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(pattern=r"^[^\x00]*$")] = None,
    categoria_id: Annotated[int | None, Query(gt=0)] = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(skip, limit, search.strip() if search else None, categoria_id, disponible)


@router.get("/{id}", responses=producto_404)
def obtener(id: int, service: ProductoDep) -> ProductoRead:
    try:
        return service.obtener(id)
    except ProductoNoEncontrado as error:
        raise HTTPException(404, str(error)) from error


@router.post("", status_code=201, responses={404: {"description": "Categoría no encontrada"}})
def crear(data: ProductoCreate, _admin: AdminUser, service: ProductoDep) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as error:
        raise HTTPException(404, str(error)) from error


@router.put("/{id}", responses={404: {"description": "Producto o categoría no encontrados"}})
def actualizar(
    id: int, data: ProductoUpdate, _admin: AdminUser, service: ProductoDep
) -> ProductoRead:
    try:
        return service.actualizar(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as error:
        raise HTTPException(404, str(error)) from error


@router.patch("/{id}/stock", responses=producto_404)
def cambiar_stock(
    id: int, data: ProductoStockUpdate, _admin: AdminUser, service: ProductoDep
) -> ProductoRead:
    try:
        return service.cambiar_stock(id, data)
    except ProductoNoEncontrado as error:
        raise HTTPException(404, str(error)) from error


@router.delete("/{id}", status_code=204, responses=producto_404)
def eliminar(id: int, _admin: AdminUser, service: ProductoDep) -> None:
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as error:
        raise HTTPException(404, str(error)) from error
