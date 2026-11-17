from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Security
from fastapi.security import APIKeyCookie
from jose import JWTError

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

from .security import decode_access_token

cookie_scheme = APIKeyCookie(name="access_token", auto_error=False)


def get_current_user(access_token: Annotated[str | None, Security(cookie_scheme)]) -> UserPublic:
    if access_token is None:
        raise HTTPException(401, "Sesión requerida.")
    try:
        usuario_id = decode_access_token(access_token)
    except (JWTError, ValueError) as error:
        raise HTTPException(401, "Sesión inválida o vencida.") from error

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise HTTPException(401, "Sesión inválida o vencida.")
        return UserPublic.model_validate(usuario)


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(400, "Cuenta de usuario desactivada")
    return usuario


ActiveUser = Annotated[UserPublic, Depends(get_current_active_user)]


def require_role(roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    def verificar(usuario: ActiveUser) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(403, "No tenés permisos para realizar esta acción.")
        return usuario

    return verificar


AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
