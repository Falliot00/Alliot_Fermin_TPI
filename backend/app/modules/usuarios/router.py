from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import AdminUser

from .schemas import UserPublic
from .service import UsuarioService
from .unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


UsuarioDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("")
def listar(_admin: AdminUser, service: UsuarioDep) -> list[UserPublic]:
    return service.listar()


@router.post("/{id}/activar")
def activar(id: int, admin: AdminUser, service: UsuarioDep) -> UserPublic:
    return service.cambiar_estado(id, False, admin.id)


@router.post("/{id}/desactivar")
def desactivar(id: int, admin: AdminUser, service: UsuarioDep) -> UserPublic:
    return service.cambiar_estado(id, True, admin.id)
