# Migrations

This project uses Alembic for schema versioning.

## Create migration

```bash
cd backend
alembic revision --autogenerate -m "initial schema"
```

## Apply migrations

```bash
cd backend
alembic upgrade head
```
