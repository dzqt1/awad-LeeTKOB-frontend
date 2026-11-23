# AI use log

This log records project-specific prompts, changes kept, and suggestions rejected.
It follows the backend log convention: record the prompt scope, identify contract
requirements, and distinguish implemented work from explicitly rejected approaches.

## Tool

- OpenAI Codex / Copilot SDK in the project workspace.

## Prompts

### P-01 — Build the frontend from contracts and prototypes

> Xây dựng frontend cho hệ thống theo các constract đã đính kèm.
> Sử dụng React Typescript, Tailwind và Shadcn.
> Chia folder theo kiến trúc React chuẩn, tạo file .env.example ghi những biến môi trường cần điền (nếu cần thiết).
> Prototype cho các màn hình nằm trong folder frontend-prototype, data lấy từ backend thực tế thay vì data trong prototype.

Scope: build role-based React screens using the attached API contracts and
prototype layouts, wire existing backend routes, and avoid presenting
unimplemented contract-only features as working APIs.

#### Changed / Rejected

- **Changed:** wired screen to API endpoints, add constraints and tests input in lab creating page.
- **Rejected:** using mock users, classes, labs, or submission results as final application data. Seed/demo objects were removed in favor of backend responses.