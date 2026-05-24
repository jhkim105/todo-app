from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

# Base configuration for camelCase serialization/deserialization
class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

# Category Schemas
class CategoryRequest(CamelModel):
    name: str
    color: str

class CategoryResponse(CamelModel):
    id: int
    name: str
    color: str

# Task Schemas
class TaskRequest(CamelModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    due_date: Optional[datetime] = None
    priority: str  # "LOW", "MEDIUM", "HIGH"
    category_id: Optional[int] = None

class TaskResponse(CamelModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool
    due_date: Optional[datetime] = None
    priority: str
    category: Optional[CategoryResponse] = None
