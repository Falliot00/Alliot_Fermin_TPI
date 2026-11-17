from datetime import UTC, datetime
from typing import Annotated

from pydantic import AfterValidator, StringConstraints

Texto = Annotated[str, StringConstraints(pattern=r"^[^\x00]*$")]


def normalizar_utc(value: datetime) -> datetime:
    # SQLite devuelve sin zona horaria las fechas que guardamos en UTC.
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


FechaUtc = Annotated[datetime, AfterValidator(normalizar_utc)]
