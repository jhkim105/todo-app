# 2026-05-24 pnpm 모노레포 환경에서의 Prisma Client 초기화 에러 해결 일지

## 🚨 1. 발생한 문제 (Issue)
*   **상황**: 루트에서 `pnpm dev:nest`로 NestJS 백엔드 구동 시 데이터베이스 모듈 초기화 에러 발생하며 부팅 실패.
*   **에러 로그**:
    ```text
    Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
        at new PrismaClient (/Users/jihwankim/dev/my/todo-app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/default.js:43:11)
    ```

---

## 🔍 2. 원인 분석 (Root Cause)
1.  **pnpm 심링크 구조 불일치**:
    *   `backends/nestjs` 디렉토리 내부에서 개별 `npx prisma generate` 실행 시 가상 주소 외부 영역에 생성됨.
    *   루트 모노레포 명령어(`pnpm dev:nest`) 구동 시, NestJS 런타임이 참조하는 루트 가상 스토어의 `@prisma/client` 물리 경로와 불일치하여 로드 실패.
2.  **pnpm 10 보안 정책에 따른 빌드 차단**:
    *   최신 pnpm 10+ 버전에 추가된 `postinstall` 빌드 스크립트 실행 기본 차단 정책.
    *   Prisma 컴파일에 필수적인 로컬 빌드 스크립트가 실행되지 못함.

---

## 🛠️ 3. 해결 프로세스 (Resolution)

### 단계 1: pnpm 10 빌드 스크립트 승인 허용
루트 `pnpm-workspace.yaml` 파일에 `allowBuilds` 속성 지정 및 빌드 강제 승인 처리.

*   **[pnpm-workspace.yaml](pnpm-workspace.yaml) 수정**:
    ```yaml
    allowBuilds:
      '@nestjs/core': true
      '@prisma/client': true
      '@prisma/engines': true
      prisma: true
      unrs-resolver: true
    ```
*   **승인 명령어 실행**:
    ```bash
    pnpm approve-builds --all
    ```

### 단계 2: pnpm 필터를 이용한 Prisma Client 빌드
개별 디렉토리 진입 대신 루트에서 모노레포 필터 옵션을 활용하여 전역 가상 스토어 상에 바이너리 컴파일 강제 적용.
```bash
pnpm --filter nestjs exec prisma generate
```

---

## 💡 4. 오늘의 배움 (Key Takeaways)
1.  **모노레포 CLI 실행 표준**: pnpm 워크스페이스 내 로컬 명령어 호출 시, 가상 스토어 맵핑 꼬임을 방지하기 위해 루트 수준에서 **`pnpm --filter <package> exec <command>`** 포맷을 활용함.
2.  **pnpm 10 보안 빌드 대응**: 외부 패키지 설치 시 `allowBuilds`를 수동으로 신뢰 승인해야 빌드 파이프라인 정상 가동 가능함.
