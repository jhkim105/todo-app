# 🤖 AI Agent Guide for Todo-App

This repository contains specific guidelines and workflows to help AI coding assistants (like Antigravity, Cursor, Windsurf, Aider, etc.) navigate and contribute effectively.

---

## 📖 Key Documentation Conventions

Whenever the user requests you to write, add, or summarize technical concepts or fix issues (e.g., "스터디 문서 추가해줘", "기술 정리해줘", "에러 해결 일지 작성해줘", "트러블슈팅 정리해줘"), please follow these simplified documentation guidelines.

### 🚨 Core Rules for AI Documentation
- **장황하지 않게 핵심만 작성 (Concise & Core-focused)**: 서론(인사말, 도입부)과 결론(소감, 맺음말) 같은 불필요한 사설을 완전히 배제하고, 문서의 첫 줄부터 즉시 핵심 내용으로 시작합니다.
- **가독성 및 시각화 (Readability)**: 긴 줄글보다는 **비교 표(Table)**, **목록(List)**, **흐름도(Mermaid)**를 적극 활용하여 한눈에 파악하기 쉽게 작성합니다.
- **로그 및 코드의 적절한 축약**: 에러 메시지나 코드 수정 내역 전체를 덤프하지 말고, 관련 없는 노이즈는 적극 생략(`...`)하여 핵심 부분만 노출합니다.
- **자연스러운 문체**: 극단적인 명사형 종결을 강제하지 않으며, 의미 전달이 명확하고 자연스러운 문체를 사용합니다.

### 📂 Save Path & Naming
- **Troubleshooting Logs (트러블슈팅/에러 해결 문서)**
  - 경로: `doc/troubleshooting/YYYY-MM-DD-error-slug.md`
  - 내용: 유연하게 구성하되, **발생한 문제(Issue)**와 **해결 프로세스(Resolution)** 두 가지 파트는 명확히 분리하여 포함해야 합니다.
