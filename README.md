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