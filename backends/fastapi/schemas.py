from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

# Base configuration for camelCase serialization/deserialization
class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

# ─── Error Schema ──────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    detail: str = Field(..., description="에러 메시지", examples=["Category not found"])

# ─── Category Schemas ──────────────────────────────────────────────────────────

class CategoryRequest(CamelModel):
    name: str = Field(..., description="카테고리 이름", examples=["Work"])
    color: str = Field(..., description="카테고리 색상 Hex 코드", examples=["#FF5733"])

class CategoryResponse(CamelModel):
    id: int = Field(..., description="카테고리 ID")
    name: str = Field(..., description="카테고리 이름")
    color: str = Field(..., description="카테고리 색상 Hex 코드")

# ─── Task Schemas ──────────────────────────────────────────────────────────────

class TaskRequest(CamelModel):
    title: str = Field(..., description="Task 제목", examples=["Submit Report"])
    description: Optional[str] = Field(None, description="Task 상세 설명")
    completed: bool = Field(False, description="완료 여부")
    due_date: Optional[datetime] = Field(None, description="마감일 (ISO-8601)", examples=["2026-05-31T23:59:59+09:00"])
    priority: Literal["LOW", "MEDIUM", "HIGH"] = Field(..., description="우선순위", examples=["HIGH"])
    category_id: Optional[int] = Field(None, description="연결할 카테고리 ID")

class TaskResponse(CamelModel):
    id: int = Field(..., description="Task ID")
    title: str = Field(..., description="Task 제목")
    description: Optional[str] = Field(None, description="Task 상세 설명")
    completed: bool = Field(..., description="완료 여부")
    due_date: Optional[datetime] = Field(None, description="마감일 (ISO-8601)")
    priority: str = Field(..., description="우선순위 (LOW, MEDIUM, HIGH)")
    category: Optional[CategoryResponse] = Field(None, description="연결된 카테고리")
