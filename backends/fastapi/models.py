from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship, Column, TEXT, DateTime

class Category(SQLModel, table=True):
    __tablename__ = "categories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False)
    color: str = Field(nullable=False)

    tasks: List["Task"] = Relationship(
        back_populates="category", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(nullable=False)
    description: Optional[str] = Field(default=None, sa_column=Column(TEXT, nullable=True))
    completed: bool = Field(default=False, nullable=False)
    
    # Matches the timestamp(6) with time zone column created by Hibernate
    due_date: Optional[datetime] = Field(
        default=None, 
        sa_column=Column("due_date", DateTime(timezone=True), nullable=True)
    )
    
    priority: str = Field(default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id", nullable=True)

    category: Optional[Category] = Relationship(back_populates="tasks")
