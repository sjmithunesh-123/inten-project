Supabase migrations and setup for Smart Agriculture

Instructions:

1. Create a Supabase project at https://app.supabase.com
2. Go to Settings -> Database -> connect string to run migrations, or use the Supabase CLI
3. In SQL Editor, run files in `supabase/migrations` in order (001..)
4. Run `supabase/migrations/002_auth_profile_trigger.sql` to create the auth->profile trigger
5. Run `supabase/seed.sql` to insert content-only seed data

Notes:
- After running migrations, enable Storage and create a bucket named `prediction-images`.
- Configure Storage policies in `003_storage_policies.sql` (not included; create according to your security model).
