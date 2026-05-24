from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy.orm import joinedload

from database import engine, get_session
from models import Category, Task
from schemas import (
    CategoryRequest, 
    CategoryResponse, 
    TaskRequest, 
    TaskResponse
)

app = FastAPI(
    title="Todo App Multi-Backend API - FastAPI",
    description="FastAPI implementation of the Todo Application backend, compliant with OpenAPI spec.",
    version="1.0.0"
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Category Routes ---

@app.get("/api/categories", response_model=List[CategoryResponse])
def get_categories(session: Session = Depends(get_session)):
    categories = session.exec(select(Category)).all()
    return categories

@app.post("/api/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(request: CategoryRequest, session: Session = Depends(get_session)):
    category = Category(name=request.name, color=request.color)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@app.delete("/api/categories/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(id: int, session: Session = Depends(get_session)):
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    session.delete(category)
    session.commit()
    return

# --- Task Routes ---

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(
    category_id: Optional[int] = Query(None, alias="categoryId"), 
    session: Session = Depends(get_session)
):
    # Optimize query with eager load (joins fetched category to avoid N+1 query issue, just like Hibernate JOIN FETCH)
    statement = select(Task).options(joinedload(Task.category))
    
    if category_id is not None:
        statement = statement.where(Task.category_id == category_id)
        
    tasks = session.exec(statement).all()
    return tasks

@app.post("/api/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(request: TaskRequest, session: Session = Depends(get_session)):
    # Validate category if provided
    category = None
    if request.category_id is not None:
        category = session.get(Category, request.category_id)
        if not category:
            raise HTTPException(status_code=404, detail=f"Category not found with id: {request.category_id}")
            
    task = Task(
        title=request.title,
        description=request.description,
        completed=request.completed,
        due_date=request.due_date,
        priority=request.priority,
        category_id=request.category_id
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    
    # Associate eager relationship back for schema mapping in the response
    task.category = category
    return task

@app.put("/api/tasks/{id}", response_model=TaskResponse)
def update_task(id: int, request: TaskRequest, session: Session = Depends(get_session)):
    task = session.get(Task, id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task not found with id: {id}")
        
    category = None
    if request.category_id is not None:
        category = session.get(Category, request.category_id)
        if not category:
            raise HTTPException(status_code=404, detail=f"Category not found with id: {request.category_id}")
            
    # Update properties
    task.title = request.title
    task.description = request.description
    task.completed = request.completed
    task.due_date = request.due_date
    task.priority = request.priority
    task.category_id = request.category_id
    
    session.add(task)
    session.commit()
    session.refresh(task)
    
    # Associate eager relationship back
    task.category = category
    return task

@app.delete("/api/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(id: int, session: Session = Depends(get_session)):
    task = session.get(Task, id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task not found")
    session.delete(task)
    session.commit()
    return
