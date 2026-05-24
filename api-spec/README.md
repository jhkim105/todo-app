# Todo App API Reference

공통 OpenAPI 3.0 스펙 기반. 모든 백엔드가 동일한 엔드포인트/스키마를 구현함.

## 백엔드별 Swagger UI

| 백엔드 | 서버 URL | Swagger UI | OpenAPI JSON/YAML |
|--------|----------|------------|-------------------|
| Spring Boot (Kotlin) | `http://localhost:8080` | [/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) | [/openapi3.yaml](http://localhost:8080/openapi3.yaml) |
| FastAPI (Python) | `http://localhost:8000` | [/docs](http://localhost:8000/docs) · [/redoc](http://localhost:8000/redoc) | [/openapi.json](http://localhost:8000/openapi.json) |
| NestJS (TypeScript) | `http://localhost:3333` | [/docs](http://localhost:3333/docs) | [/docs-json](http://localhost:3333/docs-json) |
| Flask (Python) | `http://localhost:5000` | — | — |

---

## Endpoints

### Categories

| Method | Path | 설명 | 응답 코드 |
|--------|------|------|-----------|
| `GET` | `/api/categories` | 전체 카테고리 목록 조회 | 200 |
| `POST` | `/api/categories` | 카테고리 생성 | 201 |
| `DELETE` | `/api/categories/{id}` | 카테고리 삭제 (연관 Task cascade) | 204, 404 |

### Tasks

| Method | Path | 설명 | 응답 코드 |
|--------|------|------|-----------|
| `GET` | `/api/tasks` | Task 목록 조회 (`?categoryId=N` 필터) | 200 |
| `POST` | `/api/tasks` | Task 생성 | 201, 404 |
| `PUT` | `/api/tasks/{id}` | Task 전체 수정 | 200, 404 |
| `DELETE` | `/api/tasks/{id}` | Task 삭제 | 204, 404 |

---

## Schemas

### CategoryRequest
```json
{
  "name": "Work",
  "color": "#FF5733"
}
```

### CategoryResponse
```json
{
  "id": 1,
  "name": "Work",
  "color": "#FF5733"
}
```

### TaskRequest
```json
{
  "title": "Submit Report",
  "description": "Quarterly financial report",
  "completed": false,
  "dueDate": "2026-05-31T23:59:59+09:00",
  "priority": "HIGH",
  "categoryId": 1
}
```
> `priority`: `LOW` | `MEDIUM` | `HIGH`  
> `dueDate`, `description`, `categoryId`: Optional

### TaskResponse
```json
{
  "id": 1,
  "title": "Submit Report",
  "description": "Quarterly financial report",
  "completed": false,
  "dueDate": "2026-05-31T23:59:59+09:00",
  "priority": "HIGH",
  "category": {
    "id": 1,
    "name": "Work",
    "color": "#FF5733"
  }
}
```

---

## 공통 스펙 파일

[`todo-api.yaml`](./todo-api.yaml) — OpenAPI 3.0.3 공통 명세 (모든 백엔드 준수 기준)
