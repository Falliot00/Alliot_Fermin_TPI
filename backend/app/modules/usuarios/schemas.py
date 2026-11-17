from pydantic import EmailStr
from sqlmodel import SQLModel

from app.core.schema import FechaUtc

from .models import Role


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: Role
    disabled: bool
    created_at: FechaUtc
