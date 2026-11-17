from typing import Annotated

from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import get_settings
from app.core.deps import ActiveUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

from .schemas import Mensaje, UserCreate
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


AuthDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", status_code=201)
def register(data: UserCreate, service: AuthDep) -> UserPublic:
    return service.registrar(data)


@router.post("/token")
def token(
    form: Annotated[OAuth2PasswordRequestForm, Depends()], service: AuthDep, response: Response
) -> Mensaje:
    settings = get_settings()
    response.set_cookie(
        "access_token",
        service.autenticar(form.username, form.password),
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
        max_age=settings.access_token_expire_minutes * 60,
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout")
def logout(response: Response) -> Mensaje:
    response.delete_cookie(
        "access_token", path="/", httponly=True, secure=get_settings().cookie_secure, samesite="lax"
    )
    return Mensaje(message="Sesión cerrada")


@router.get("/me")
def me(usuario: ActiveUser) -> UserPublic:
    return usuario
