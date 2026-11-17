from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core import database


class UnitOfWork:
    session: Session

    def __enter__(self) -> Self:
        self.session = database.session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        except BaseException:
            self.session.rollback()
            raise
        finally:
            self.session.close()
