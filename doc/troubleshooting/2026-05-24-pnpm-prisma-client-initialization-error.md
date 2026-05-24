# 2026-05-24 pnpm 모노레포 환경에서의 Prisma Client 초기화 에러 해결 일지

## 🚨 1. 발생한 문제 (Issue)
프로젝트 루트에서 `pnpm dev:nest` 명령을 실행하여 NestJS 백엔드 구동 시, 데이터베이스 모듈 초기화 단계에서 아래와 같은 모듈 해석 오류가 발생하며 부팅에 실패했습니다.

```text
[Nest] 85880  - 05/24/2026, 11:25:32 AM   ERROR [ExceptionHandler] Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
    at new PrismaClient (/Users/jihwankim/dev/my/todo-app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/default.js:43:11)
```

---

## 🔍 2. 원인 분석 (Root Cause)

### 1) pnpm의 심링크 및 가상 스토어 구조
- `npm`과 달리 `pnpm`은 각 프로젝트 폴더에 패키지를 복사하지 않고, 루트의 `.pnpm` 디렉토리(Content-Addressable Store)에 패키지를 단 하나만 다운로드한 후 프로젝트 내부의 `node_modules`에 심링크(Symlink)를 연결합니다.
- `backends/nestjs` 디렉토리 안에서 단순 로컬 명령인 `npx prisma generate`를 호출하면 가상 주소 바깥에 클라이언트가 생성됩니다.
- 이로 인해 루트 수준에서 모노레포 명령어(`pnpm dev:nest`)로 구동 시, NestJS 런타임이 참조하는 루트 가상 스토어 상의 `@prisma/client`와 물리 경로가 일치하지 않아 "Did not initialize yet" 에러가 터졌습니다.

### 2) pnpm 10/11의 빌드 스크립트 보안 차단 (Ignored Build Scripts)
- 최신 pnpm 10 이상 버전에서는 외부 패키지가 가상 머신이나 로컬에서 스크립트를 임의 기동하는 위험을 방지하기 위해 `postinstall` 빌드 스크립트 실행을 기본적으로 자동 차단(Ignore)합니다.
- Prisma는 자바스크립트 바인딩을 컴파일하기 위해 `postinstall` 빌드가 필수이므로 이 차단 또한 함께 해제해야 정상 구동됩니다.

---

## 🛠️ 3. 해결 프로세스 (Resolution)

### 단계 1: pnpm 10/11 전용 빌드 승인 적용
루트에 존재하는 `pnpm-workspace.yaml` 파일에 `allowBuilds` 속성을 기재하여 해당 라이브러리들이 로컬 빌드 스크립트를 기동할 수 있도록 보안 신뢰 처리를 적용했습니다.

* **[pnpm-workspace.yaml](pnpm-workspace.yaml)** 수정 내역:
```yaml
allowBuilds:
  '@nestjs/core': true
  '@prisma/client': true
  '@prisma/engines': true
  prisma: true
  unrs-resolver: true
```

* **보안 신뢰 1회성 강제 승인 명령어**:
```bash
pnpm approve-builds --all
```

### 단계 2: pnpm 워크스페이스 컨텍스트에서 Prisma Client 재생성
단순 `npx` 기동을 멈추고, pnpm 워크스페이스 구조를 완벽하게 인지하는 **필터(Filter) 명령어**를 이용하여 모노레포의 공유 가상 스토어 영역에 바이너리가 컴파일되도록 강제했습니다.
```bash
pnpm --filter nestjs exec prisma generate
```
* **결과**: `Prisma Client (v5.22.0) to ./../../node_modules/.pnpm/...` 경로에 완벽하게 정합성 있는 클라이언트 파일들이 빌드되어 NestJS 의존성 에러가 완전히 해소되었습니다.

---

## 💡 4. 오늘의 배움 (Key Takeaways)
1. **pnpm 워크스페이스** 내에서 실행되는 CLI 도구들은 개별 폴더 내에서 `npx`로 실행하는 것보다, 루트에서 **`pnpm --filter <package_name> exec <command>`** 포맷을 활용하는 것이 가상 스토어 의존성 맵핑 충돌을 방지하는 가장 안전한 실무 표준 방식입니다.
2. 최신 pnpm 10 환경에서는 설치된 패키지의 빌드가 차단될 수 있으므로, `pnpm-workspace.yaml`에 `allowBuilds`를 적절히 명시하여 관리해야 모노레포 빌드 파이프라인의 자동화를 해치지 않습니다.
