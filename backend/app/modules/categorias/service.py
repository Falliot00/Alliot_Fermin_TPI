from sqlalchemy.exc import IntegrityError

from .models import Categoria
from .repository import CategoriaRepository
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    def __init__(self):
        super().__init__("Categoría no encontrada.")


class NombreDuplicado(Exception):
    def __init__(self):
        super().__init__("Ya existe una categoría con ese nombre.")


def categoria_activa(repo: CategoriaRepository, id: int, *, for_update: bool = False) -> Categoria:
    categoria = repo.get_by_id(id, for_update=for_update)
    if categoria is None or not categoria.activo:
        raise CategoriaNoEncontrada()
    return categoria


def validar_nombre(repo: CategoriaRepository, nombre: str, id: int | None = None) -> None:
    existente = repo.get_by_nombre(nombre)
    if existente is not None and existente.id != id:
        raise NombreDuplicado()


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(item) for item in uow.categorias.list_activas()]

    def obtener(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(categoria_activa(uow.categorias, id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        try:
            with self.uow as uow:
                validar_nombre(uow.categorias, data.nombre)
                categoria = uow.categorias.add(Categoria.model_validate(data))
                return CategoriaRead.model_validate(categoria)
        except IntegrityError as error:
            raise NombreDuplicado() from error

    def actualizar(self, id: int, data: CategoriaUpdate) -> CategoriaRead:
        try:
            with self.uow as uow:
                categoria = categoria_activa(uow.categorias, id, for_update=True)
                if data.nombre is not None:
                    validar_nombre(uow.categorias, data.nombre, id)
                categoria.sqlmodel_update(data.model_dump(exclude_unset=True))
                return CategoriaRead.model_validate(categoria)
        except IntegrityError as error:
            raise NombreDuplicado() from error

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            categoria = categoria_activa(uow.categorias, id, for_update=True)
            categoria.activo = False
