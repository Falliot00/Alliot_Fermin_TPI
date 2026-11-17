from app.modules.categorias.service import categoria_activa

from .models import Producto
from .repository import ProductoRepository
from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    def __init__(self, id: int):
        super().__init__(f"Producto #{id} no encontrado.")


def producto_activo(repo: ProductoRepository, id: int, *, for_update: bool = False) -> Producto:
    producto = repo.get_by_id(id, for_update=for_update)
    if producto is None or not producto.activo:
        raise ProductoNoEncontrado(id)
    return producto


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(item) for item in productos]
            )

    def obtener(self, id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(producto_activo(uow.productos, id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = categoria_activa(uow.categorias, data.categoria_id, for_update=True)
            producto = Producto.model_validate(data)
            producto.categoria = categoria
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = producto_activo(uow.productos, id, for_update=True)
            if data.categoria_id is not None:
                producto.categoria = categoria_activa(
                    uow.categorias, data.categoria_id, for_update=True
                )
            producto.sqlmodel_update(data.model_dump(exclude_unset=True, exclude={"categoria_id"}))
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def cambiar_stock(self, id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = producto_activo(uow.productos, id, for_update=True)
            producto.sqlmodel_update(data.model_dump())
            return ProductoRead.model_validate(producto)

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            producto = producto_activo(uow.productos, id, for_update=True)
            producto.activo = False
