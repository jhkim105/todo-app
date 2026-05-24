# 🤖 AI Agent Guide for Todo-App

This repository contains specific guidelines and workflows to help AI coding assistants (like Antigravity, Cursor, Windsurf, Aider, etc.) navigate and contribute effectively.

---

## 📖 Key Documentation Conventions

Whenever the user requests you to write, add, or summarize technical concepts or fix issues (e.g., "스터디 문서 추가해줘", "기술 정리해줘", "에러 해결 일지 작성해줘", "트러블슈팅 정리해줘"), you **MUST** read and strictly follow the formatting and structural guidelines defined in our unified project documentation guidelines:
👉 **[project-documentation-guidelines.md](file:///Users/jihwankim/dev/my/todo-app/doc/guidelines/project-documentation-guidelines.md)**

### 🚨 Core Rules Summary for AI
- **Extreme Conciseness**: Every explanation must be **under 2 lines**. Prefer 1:1 tabular comparisons and Mermaid diagrams.
- **Tone**: Nominal endings only (명사형 종결, e.g., `~함`, `~로 해결`, `~방지`). Do not use friendly conversational endings (`~했습니다`, `~보겠습니다`).
- **Zero Fluff**: Absolutely **no greetings, introductions, or conclusions**. Begin immediately with H1/H2 headers.
- **Log / Code Truncation**: Keep error logs and Git diffs down to **~10 lines** by actively truncating irrelevant noise using `...`.

### 📂 Save Path & Naming
- **Study Docs**: `doc/study/YYYY-MM-DD-topic-slug.md` (Strict 5-part layout)
- **Troubleshooting Logs**: `doc/troubleshooting/YYYY-MM-DD-error-slug.md` (Must contain Issue & Resolution)
