# Smart Agriculture System Backend

## Overview

This FastAPI backend powers the Smart Agriculture System for plant disease detection and crop recommendation.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## Environment

Set the Supabase project URL and service-role key in `.env`. `DATABASE_URL` must be
the PostgreSQL connection string copied from Supabase Dashboard > Connect. Use the
pooler connection string on networks that do not support direct database access.

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
```

## Database

```bash
cd backend
alembic upgrade head
```

## Run

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API docs

- http://localhost:8000/docs
- http://localhost:8000/redoc
