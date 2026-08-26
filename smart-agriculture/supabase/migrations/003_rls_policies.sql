-- 003_rls_policies.sql
-- Enable RLS and policies for sensitive tables

-- users (profile)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- allow users to select their own profile
DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own ON public.users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- disease_predictions
ALTER TABLE public.disease_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS disease_predictions_user_select ON public.disease_predictions;
CREATE POLICY disease_predictions_user_select ON public.disease_predictions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS disease_predictions_user_insert ON public.disease_predictions;
CREATE POLICY disease_predictions_user_insert ON public.disease_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- crop_recommendations
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crop_recommendations_user_select ON public.crop_recommendations;
CREATE POLICY crop_recommendations_user_select ON public.crop_recommendations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS crop_recommendations_user_insert ON public.crop_recommendations;
CREATE POLICY crop_recommendations_user_insert ON public.crop_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- audit_logs: only admins can view all, users can view their own
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_user_select ON public.audit_logs;
CREATE POLICY audit_logs_user_select ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert audit logs for themselves
DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
