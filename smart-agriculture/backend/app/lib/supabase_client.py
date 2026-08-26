import os

try:
    from supabase import create_client
except ModuleNotFoundError:  # pragma: no cover - handled in local dev without Supabase package
    create_client = None

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

supabase = None
if create_client and SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
