from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import AdminUser

from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


CategoriaDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("")
def listar(service: CategoriaDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{id}", responses={404: {"description": "Categoría no encontrada"}})
def obtener(id: int, service: CategoriaDep) -> CategoriaRead:
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(404, str(error)) from error


@router.post("", status_code=201, responses={409: {"description": "Nombre duplicado"}})
def crear(data: CategoriaCreate, _admin: AdminUser, service: CategoriaDep) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as error:
        raise HTTPException(409, str(error)) from error


@router.put(
    "/{id}",
    responses={
        404: {"description": "Categoría no encontrada"},
        409: {"description": "Nombre duplicado"},
    },
)
def actualizar(
    id: int, data: CategoriaUpdate, _admin: AdminUser, service: CategoriaDep
) -> CategoriaRead:
    try:
        return service.actualizar(id, data)
    except CategoriaNoEncontrada as error:
        raise HTTPException(404, str(error)) from error
    except NombreDuplicado as error:
        raise HTTPException(409, str(error)) from error


@router.delete(
    "/{id}", status_code=204, responses={404: {"description": "Categoría no encontrada"}}
)
def eliminar(id: int, _admin: AdminUser, service: CategoriaDep) -> None:
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(404, str(error)) from error
