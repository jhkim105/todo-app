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
    TaskResponse,
    ErrorResponse,
)

app = FastAPI(
    title="Todo App API - FastAPI",
    description=(
        "Todo 애플리케이션 REST API.\n\n"
        "## Categories\n"
        "카테고리 CRUD 엔드포인트\n\n"
        "## Tasks\n"
        "카테고리별 필터링 지원 Task CRUD 엔드포인트"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
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

# ─── Category Routes ───────────────────────────────────────────────────────────

@app.get(
    "/api/categories",
    response_model=List[CategoryResponse],
    tags=["Categories"],
    summary="카테고리 목록 조회",
    description="등록된 모든 카테고리를 반환함.",
)
def get_categories(session: Session = Depends(get_session)):
    categories = session.exec(select(Category)).all()
    return categories


@app.post(
    "/api/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Categories"],
    summary="카테고리 생성",
    description="새 카테고리를 생성하고 생성된 리소스를 반환함.",
    responses={
        201: {"description": "생성 성공", "model": CategoryResponse},
    },
)
def create_category(request: CategoryRequest, session: Session = Depends(get_session)):
    category = Category(name=request.name, color=request.color)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@app.delete(
    "/api/categories/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Categories"],
    summary="카테고리 삭제",
    description="ID로 카테고리를 삭제함. 연관된 Task도 함께 삭제됨(cascade).",
    responses={
        204: {"description": "삭제 성공"},
        404: {"description": "카테고리 없음", "model": ErrorResponse},
    },
)
def delete_category(id: int, session: Session = Depends(get_session)):
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    session.delete(category)
    session.commit()
    return

# ─── Task Routes ───────────────────────────────────────────────────────────────

@app.get(
    "/api/tasks",
    response_model=List[TaskResponse],
    tags=["Tasks"],
    summary="Task 목록 조회",
    description="전체 Task 목록을 반환함. `categoryId` 쿼리 파라미터로 카테고리 필터링 가능.",
)
def get_tasks(
    category_id: Optional[int] = Query(
        None,
        alias="categoryId",
        description="필터링할 카테고리 ID (Optional)",
    ),
    session: Session = Depends(get_session),
):
    # Eager load category to avoid N+1 query
    statement = select(Task).options(joinedload(Task.category))
    if category_id is not None:
        statement = statement.where(Task.category_id == category_id)
    tasks = session.exec(statement).all()
    return tasks


@app.post(
    "/api/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Tasks"],
    summary="Task 생성",
    description="새 Task를 생성하고 생성된 리소스를 반환함. `categoryId`가 존재하지 않으면 404 반환.",
    responses={
        201: {"description": "생성 성공", "model": TaskResponse},
        404: {"description": "카테고리 없음", "model": ErrorResponse},
    },
)
def create_task(request: TaskRequest, session: Session = Depends(get_session)):
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
        category_id=request.category_id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    task.category = category
    return task


@app.put(
    "/api/tasks/{id}",
    response_model=TaskResponse,
    tags=["Tasks"],
    summary="Task 수정",
    description="ID로 Task를 조회하여 전체 업데이트(PUT semantics)함.",
    responses={
        200: {"description": "수정 성공", "model": TaskResponse},
        404: {"description": "Task 또는 카테고리 없음", "model": ErrorResponse},
    },
)
def update_task(id: int, request: TaskRequest, session: Session = Depends(get_session)):
    task = session.get(Task, id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task not found with id: {id}")

    category = None
    if request.category_id is not None:
        category = session.get(Category, request.category_id)
        if not category:
            raise HTTPException(status_code=404, detail=f"Category not found with id: {request.category_id}")

    task.title = request.title
    task.description = request.description
    task.completed = request.completed
    task.due_date = request.due_date
    task.priority = request.priority
    task.category_id = request.category_id

    session.add(task)
    session.commit()
    session.refresh(task)
    task.category = category
    return task


@app.delete(
    "/api/tasks/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Tasks"],
    summary="Task 삭제",
    description="ID로 Task를 삭제함.",
    responses={
        204: {"description": "삭제 성공"},
        404: {"description": "Task 없음", "model": ErrorResponse},
    },
)
def delete_task(id: int, session: Session = Depends(get_session)):
    task = session.get(Task, id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
    return
