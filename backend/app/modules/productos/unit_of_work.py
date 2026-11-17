from typing import Self

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository

from .repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    def __enter__(self) -> Self:
        super().__enter__()
        self.categorias = CategoriaRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
