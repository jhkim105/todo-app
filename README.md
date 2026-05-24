# 🚀 Multi-Backend Todo Application (Monorepo)

본 프로젝트는 프론트엔드와 데이터베이스 환경을 단일화하고, 다양한 백엔드 기술 스택(Spring Boot Kotlin, FastAPI, Flask 등)을 학습하고 비교하기 위해 구축된 **다중 백엔드 모노레포(Monorepo) 할 일 관리 애플리케이션**입니다.

동일한 OpenAPI 3.0 API 스펙 명세서를 모든 백엔드가 충족하도록 설계되어 있으며, 프론트엔드 내 설정 UI를 통해 호출할 백엔드 주소를 즉시 스위칭할 수 있습니다.

---

## 📂 프로젝트 디렉토리 구조 (Monorepo)

```text
/todo-app
  ├── docker-compose.yml       # 공유 데이터베이스 (PostgreSQL) 인프라
  ├── api-spec/
  │   └── todo-api.yaml        # OpenAPI 3.0 공통 API 스펙 명세서
  ├── backends/
  │   ├── spring-kotlin/       # 🟢 Spring Boot + Kotlin 백엔드
  │   ├── fastapi/             # 🔵 Python FastAPI 백엔드
  │   ├── flask/               # 🟡 Python Flask 백엔드
  │   └── nestjs/              # 🟠 NestJS (TypeScript) 백엔드
  ├── frontend/
  │   └── react/               # 🟣 React (Vite + TypeScript) 프론트엔드
  ├── README.md                # 📄 본 프로젝트 가이드 (실행 및 세팅)
  └── COMPARISON.md            # 📝 백엔드 기술 스택 비교 및 학습 분석 문서
```

---

## 🛠️ 사전 준비 사항 (Prerequisites)

로컬 실행을 위해 아래 환경이 필요합니다:
- **Docker & Docker Compose**: PostgreSQL 컨테이너 구동용
- **Java JDK 17 이상**: Spring Boot 백엔드 구동용
- **Node.js (v18+) & pnpm**: React 및 NestJS 구동용 (글로벌 설치: `npm install -g pnpm`)

---

## 🚀 실행 방법 (Getting Started)

### 1단계. 공통 데이터베이스 실행
프로젝트 루트 폴더에서 Docker Compose를 이용해 공유 PostgreSQL 컨테이너를 구동합니다.
```bash
docker-compose up -d
```
- **DB 접속 정보**:
  - Port: `5432`
  - Database: `todo_db`
  - Username: `postgres`
  - Password: `password`

---

### 2단계. 백엔드 서버 실행

#### 🟢 Option A. Spring Boot (Kotlin) 백엔드 실행
백엔드 루트 디렉토리 `/backends/spring-kotlin`으로 이동한 후 실행합니다.
```bash
cd backends/spring-kotlin
chmod +x gradlew
./gradlew bootRun
```
- **서버 URL**: `http://localhost:8080`
- **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)에서 명세 및 API 직접 호출 테스트 가능.

#### 🔵 Option B. Python FastAPI 백엔드 실행
백엔드 루트 디렉토리 `/backends/fastapi`로 이동한 후 간편 실행 스크립트를 구동합니다. (가상환경 생성, 의존성 설치, 서버 실행을 자동으로 수행합니다.)
```bash
cd backends/fastapi
./run.sh
```

또는 수동으로 가상환경을 잡고 실행할 수도 있습니다:
```bash
cd backends/fastapi
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- **서버 URL**: `http://localhost:8000`
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)에서 명세 확인 및 테스트 가능.

#### 🟡 Option C. Python Flask 백엔드 실행
백엔드 루트 디렉토리 `/backends/flask`로 이동한 후 간편 실행 스크립트를 구동합니다. (가상환경 생성, 의존성 설치, 서버 실행을 자동으로 수행합니다.)
```bash
cd backends/flask
./run.sh
```

또는 수동으로 가상환경을 잡고 실행할 수도 있습니다:
```bash
cd backends/flask
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
- **서버 URL**: `http://localhost:5000`
- **API 동작**: FastAPI와 완벽히 대응되는 엔드포인트 세트 제공.

#### 🟠 Option D. NestJS (TypeScript) 백엔드 실행
- **방법 1 (권장)**: 프로젝트 루트 디렉토리에서 글로벌 필터 명령어로 원클릭 구동합니다.
  ```bash
  pnpm dev:nest
  ```
- **방법 2**: 백엔드 루트 디렉토리 `/backends/nestjs`로 이동하여 가동합니다.
  ```bash
  cd backends/nestjs
  ./run.sh
  ```
  *(또는 수동 실행: `npx prisma generate && pnpm start:dev`)*
- **서버 URL**: `http://localhost:3333`
- **API 동작**: Prisma ORM 기반 최적화 쿼리 및 class-validator 완벽 적용.

---

### 3단계. 프론트엔드 실행

먼저 프로젝트 루트 디렉토리에서 **최초 1회 통합 의존성을 설치**해 줍니다. (pnpm 워크스페이스가 하위 모듈들을 병렬 초고속 설치합니다.)
```bash
pnpm install
```

의존성 설치가 완료되면 아래 방법으로 프론트엔드를 실행합니다.
- **방법 1 (권장)**: 프로젝트 루트 디렉토리에서 글로벌 필터 명령어로 구동합니다.
  ```bash
  pnpm dev:react
  ```
- **방법 2**: 프론트엔드 디렉토리 `/frontend/react`로 직접 이동하여 구동합니다.
  ```bash
  cd frontend/react
  pnpm dev
  ```
- **접속 URL**: [http://localhost:5173](http://localhost:5173)
- **백엔드 변경 방법**: 웹 UI 상단 우측의 **⚙️(설정 아이콘)**을 클릭하여 Spring Boot(`8080`), FastAPI(`8000`), Flask(`5000`), NestJS(`3333`) 백엔드로 실시간 커넥션을 스위칭할 수 있습니다.

---

## 📋 API 명세 요약 (OpenAPI 3.0)

모든 백엔드는 `/api-spec/todo-api.yaml`에 명세된 스펙을 100% 충족하여 응답해야 프론트엔드 오동작이 없습니다.

### 🏷️ 카테고리 (Category)
- `GET /api/categories` - 전체 카테고리 목록 조회
- `POST /api/categories` - 새 카테고리 추가
- `DELETE /api/categories/{id}` - 카테고리 삭제

### 📝 할 일 (Task)
- `GET /api/tasks` - 전체 할 일 목록 조회 (쿼리 스트링 `?categoryId=N` 필터 제공)
- `POST /api/tasks` - 새 할 일 생성
- `PUT /api/tasks/{id}` - 할 일 내용/상태 수정 (완료 토글 포함)
- `DELETE /api/tasks/{id}` - 할 일 삭제

---

## 📝 상세 학습 분석 문서
본 프로젝트를 수행하며 도출된 **Spring Boot vs Python 프레임워크 비교**, **JPA vs SQLAlchemy ORM 비교**, **아키텍처 인사이트** 등 백엔드 개발자 관점의 학습 보고서는 루트의 [COMPARISON.md](COMPARISON.md) 문서에서 자세히 다루고 있습니다.
