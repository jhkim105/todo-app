# 2026-05-24 Spring RestDoc + epages OpenAPI3 컴파일 에러 해결

## 🚨 1. 발생한 문제 (Issue)

```
e: TaskApiTests.kt:77: Unresolved reference 'requestParameters'
e: CategoryControllerTest.kt:58: None of the following candidates is applicable:
   fun document(identifier: String, resourceDetails: ResourceSnippetDetails, ...)
java.lang.NullPointerException: any(...) must not be null
```

## 🔍 2. 원인 분석 (Root Cause)

| 에러 | 원인 |
|------|------|
| `requestParameters` 미해결 | Spring REST Docs 6.x에서 `queryParameters`로 API 변경 |
| `document()` 후보 없음 | `ResourceSnippetParameters.builder()...build()`를 2번째 인자로 + snippets 동시 전달 불가 → named parameter 방식 사용 필요 |
| `willDoNothing().given(service.method())` | `given(service).method()` 체인 방식이어야 함 |
| `any(...) must not be null` | Kotlin non-null 파라미터에 `ArgumentMatchers.any()` 사용 시 NPE → `mockito-kotlin` 필요 |

## 🛠️ 3. 해결 프로세스 (Resolution)

**① `requestParameters` → `queryParameters` 교체 + import 추가**
```kotlin
import org.springframework.restdocs.request.RequestDocumentation.queryParameters
// requestParameters(...) → queryParameters(...)
```

**② `document()` 호출 방식 변경 (named parameter)**
```kotlin
// Before
document("id", ResourceSnippetParameters.builder().description("...").build(), responseFields(...))

// After
document("id", description = "...", snippets = arrayOf(responseFields(...)))
```

**③ `willDoNothing()` 체인 수정**
```kotlin
// Before (에러)
willDoNothing().given(categoryService.deleteCategory(categoryId))

// After
willDoNothing().given(categoryService).deleteCategory(categoryId)
```

**④ `mockito-kotlin` 의존성 추가 (build.gradle.kts)**
```kotlin
testImplementation("org.mockito.kotlin:mockito-kotlin:5.4.0")
// import org.mockito.kotlin.any 사용
```

**⑤ OpenAPI 순환 의존성 해결 (build.gradle.kts)**
```kotlin
// processResources → copyOpenApiSpec → openapi3 → test → processResources 순환 방지
// outputDirectory를 직접 static 경로로 지정
configure<OpenApi3Extension> {
    outputDirectory = "src/main/resources/static"
}
```

## 💡 4. 오늘의 배움 (Key Takeaways)

- Spring REST Docs 6.x에서 query parameter 문서화 API가 `requestParameters` → `queryParameters`로 변경됨
- Kotlin에서 Mockito `any()` 사용 시 반드시 `mockito-kotlin` 라이브러리 필요 (non-null 타입 안전성)
