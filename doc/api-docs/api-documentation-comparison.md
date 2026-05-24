# 백엔드별 API 문서화 방식 비교

## 📌 1. 핵심 한 줄 정의

> 백엔드 프레임워크마다 OpenAPI 스펙 생성 방식이 **코드 우선(Code-First)** vs **테스트 기반(Test-Driven)** vs **수동(Manual)**으로 구분됨.

---

## 📊 2. 비교 요약 표

| 항목 | Spring Boot (Kotlin) | FastAPI (Python) | NestJS (TypeScript) |
|------|---------------------|-----------------|---------------------|
| **라이브러리** | `spring-restdocs` + `epages restdocs-api-spec` | 내장 (Pydantic 기반) | `@nestjs/swagger` |
| **스펙 생성 방식** | 테스트 통과 후 스니펫 병합 | 코드 실행 시 자동 추출 | 코드 실행 시 자동 추출 |
| **Swagger UI** | WebJar + 커스텀 HTML | `/docs` 내장 | `/docs` 내장 |
| **OpenAPI 파일** | `./gradlew openapi3` → YAML | `export_openapi.py` → YAML | `/docs-json` → JSON |
| **설정 비용** | 높음 (테스트 작성 필수) | 거의 없음 | 낮음 (데코레이터 추가) |
| **스펙 신뢰성** | 최고 (테스트 = 스펙 보장) | 중간 (코드-스펙 불일치 가능) | 중간 (코드-스펙 불일치 가능) |

---

## 🏗️ 3. 핵심 아키텍처 비교

```mermaid
flowchart LR
  subgraph Spring["Spring Boot (Kotlin)"]
    T[MockMvc 테스트] -->|스니펫 생성| S[build/generated-snippets]
    S -->|openapi3 태스크| Y[openapi3.yaml]
    Y -->|static 복사| SW1[Swagger UI]
  end

  subgraph FastAPI["FastAPI (Python)"]
    P[Pydantic 모델 + Field] -->|app.openapi()| J2[/openapi.json]
    J2 --> SW2[/docs Swagger UI]
    J2 -->|export_openapi.py| Y2[openapi.yaml]
  end

  subgraph NestJS["NestJS (TypeScript)"]
    D[DTO + @ApiProperty] -->|SwaggerModule| J3[/docs-json]
    J3 --> SW3[/docs Swagger UI]
  end
```

---

## 🚀 4. 핵심 명령어 매핑

| 작업 | Spring Boot | FastAPI | NestJS |
|------|------------|---------|--------|
| 테스트 실행 | `./gradlew test` | — | `pnpm test` |
| OpenAPI 파일 생성 | `./gradlew openapi3` | `python export_openapi.py` | 런타임 `/docs-json` |
| Swagger UI 접근 | `:8080/swagger-ui/index.html` | `:8000/docs` | `:3333/docs` |
| ReDoc 접근 | — | `:8000/redoc` | — |
| 스펙 검증 방식 | 테스트 실패 시 빌드 실패 | 수동 확인 | 수동 확인 |

### 핵심 코드 패턴

````carousel
**Spring Boot** — 테스트에서 스니펫 생성
```kotlin
// RestDocumentationRequestBuilders + epages wrapper
mockMvc.perform(get("/api/categories"))
  .andDo(document("get-categories",
    description = "Get category list",
    snippets = arrayOf(responseFields(...))
  ))
```
<!-- slide -->
**FastAPI** — 타입힌트에서 자동 추출
```python
@app.get("/api/categories",
  response_model=List[CategoryResponse],
  tags=["Categories"],
  summary="카테고리 목록 조회",
)
def get_categories(): ...

class CategoryResponse(BaseModel):
  id: int = Field(..., description="카테고리 ID")
```
<!-- slide -->
**NestJS** — 데코레이터로 명시적 선언
```typescript
@ApiTags('Categories')
@Controller('api/categories')
export class CategoryController {
  @Get()
  @ApiOperation({ summary: '카테고리 목록 조회' })
  @ApiResponse({ status: 200, type: [CategoryResponse] })
  async getCategories() { ... }
}
```
````
