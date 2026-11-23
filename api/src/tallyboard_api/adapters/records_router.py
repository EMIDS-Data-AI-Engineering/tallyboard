from collections.abc import AsyncIterator, Callable
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from tallyboard_api.application.record_service import get_record, put_record
from tallyboard_api.domain.records import RecordRepository

NOT_FOUND = 404


class RecordWrite(BaseModel):
    value: Any


class RecordAcknowledgement(BaseModel):
    key: str
    stored_at: datetime


class RecordResponse(RecordAcknowledgement):
    value: Any


def build_records_router(repository_dependency: Callable[[], AsyncIterator[RecordRepository]]) -> APIRouter:
    router = APIRouter(prefix="/v1/records")

    @router.put("/{key}", response_model=RecordAcknowledgement)
    async def put(key: str, body: RecordWrite, repository: RecordRepository = Depends(repository_dependency)):
        return await put_record(repository, key, body.value)

    @router.get("/{key}", response_model=RecordResponse)
    async def read(key: str, repository: RecordRepository = Depends(repository_dependency)):
        record = await get_record(repository, key)
        if record is None:
            raise HTTPException(status_code=NOT_FOUND, detail="No record under this key.")
        return record

    return router
