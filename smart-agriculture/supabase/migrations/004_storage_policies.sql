-- 004_storage_policies.sql
-- Example policies for Supabase storage bucket `prediction-images`

-- NOTE: run this after creating the bucket via the Dashboard or CLI.

-- Allow owners to read their own files and upload new files to their folder
-- Assumes object keys are stored under: prediction-images/{user_id}/{filename}

-- Policy: allow public select only for admin role (example)
-- Storage policies are managed in the Storage UI; for SQL-based policies you can use pg_storage functions.

-- For detailed storage policies, configure in Supabase dashboard Storage > Policies.
