# Smart Agriculture System

A full-stack AgriTech web application for:
- plant disease detection
- crop recommendation
- authentication
- dashboard analytics
- admin management
- history tracking

## Project structure

```text
smart-agriculture/
├── backend/
├── frontend/
├── ml-models/
├── database/
├── docs/
├── tests/
├── .gitignore
├── README.md
├── docker-compose.yml
└── .env.example
```

## Local setup (Supabase)

This project has been migrated to use Supabase (Postgres, Auth, Storage).

1. Create a Supabase project at https://app.supabase.com
2. Run the SQL migrations in `supabase/migrations` (see `docs/supabase-setup.md`).
3. Copy `frontend/.env.example` -> `frontend/.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Copy `backend/.env.example` -> `backend/.env` and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL` (optional).
5. Install backend dependencies and run the API.
6. Install frontend dependencies and start the dev server.

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## Docker

```bash
docker compose up --build
```

## Testing

```bash
cd backend
pytest
```
