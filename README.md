# LeeTKOB frontend

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- LeeTKOB backend running at `http://localhost:3000`

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The frontend is available at the URL shown by Vite. Configure
`VITE_API_BASE_URL` in `.env` if the backend uses a different address.
## TA review queue (PA3)

Sign in as an assigned TA, then open **Quản lý Lab → Hàng chờ review**,
or navigate to /ta/labs/<labId>/reviews.

- **Cần duyệt** shows pending violations/unsure and a rounded-up 10% sample of
  passes across the lab. Only the latest pre-deadline submission per student counts.
- **Tất cả verdict / sửa quyết định** shows all current proposals and decisions.
- Open the source, select evidence lines, choose pass/violation explicitly, and
  enter a reason. A violation requires at least one exact source line.
- Saving records a TA decision, not a published grade. Conflicting edits return
  409; refresh and review the latest decision before trying again.
- Students and TAs outside the class cannot access review data.

The backend worker must finish judging before proposals appear. With MODEL_OFF=1,
semantic constraints appear as unsure. Gemini configuration and its key belong
only in the backend .env. The live Gemini smoke test on 2026-11-25 was blocked by
Google billing (HTTP 402); successful semantic generation remains unverified.

Validation: npm run build, npm run lint and npm run lint:biome passed.
Formatting checks passed for the changed React files; existing formatting failures
elsewhere in the repository remain outside this change.
