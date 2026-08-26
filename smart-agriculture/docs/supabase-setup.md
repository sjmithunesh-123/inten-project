# Supabase Setup

1. Create a Supabase project.
2. Copy the `API URL` and `anon` and `service_role` keys.
3. In the project SQL editor or using the Supabase CLI, run the files in `supabase/migrations` in order:
   - `001_initial_schema.sql`
   - `002_auth_profile_trigger.sql`
   - `003_rls_policies.sql`
   - `004_storage_policies.sql` (optional guidance)
4. Run `supabase/seed.sql` to insert sample plants/crops/diseases.
5. Create a Storage bucket named `prediction-images` and configure policies so users can only access their own files (use path `prediction-images/{user_id}/{filename}`).
6. Set environment variables in `frontend/.env` and `backend/.env` (see `.env.example`).
