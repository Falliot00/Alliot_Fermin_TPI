from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

from .schemas import UserCreate

DUMMY_HASH = hash_password("credencial-ficticia")


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        email = data.email.lower()
        try:
            with self.uow as uow:
                if uow.usuarios.get_by_username(data.username) or uow.usuarios.get_by_email(email):
                    raise HTTPException(409, "El nombre de usuario o el email ya está registrado.")
                usuario = uow.usuarios.add(
                    Usuario(
                        username=data.username,
                        full_name=data.full_name,
                        email=email,
                        hashed_password=hash_password(data.password.get_secret_value()),
                    )
                )
                return UserPublic.model_validate(usuario)
        except IntegrityError as error:
            raise HTTPException(
                409, "El nombre de usuario o el email ya está registrado."
            ) from error

    def autenticar(self, username: str, password: str) -> str:
        if "\x00" in username:
            raise HTTPException(401, "Credenciales incorrectas.")
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username.strip())
            valid = verify_password(password, usuario.hashed_password if usuario else DUMMY_HASH)
            if not valid or usuario is None:
                raise HTTPException(401, "Credenciales incorrectas.")
            if usuario.disabled:
                raise HTTPException(400, "Cuenta de usuario desactivada")
            assert usuario.id is not None
            return create_access_token(usuario.id)
