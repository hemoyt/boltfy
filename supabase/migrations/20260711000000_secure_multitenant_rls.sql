-- =====================================================
-- SECURE MULTI-TENANT DATA ISOLATION
-- =====================================================
-- The initial migrations left every table world-readable/
-- writable ("USING (true)"), so any client holding the
-- public anon key could read, edit, or delete every
-- user's data. This migration:
--   1. Adds user_id ownership to every table
--   2. Replaces the public policies with owner-only RLS
--   3. Adds a SECURITY DEFINER RPC so anonymous visitors
--      can still submit public forms / join a newsletter
--      without being able to spoof another user's user_id
--   4. Adds audit logging + per-user rate limits
-- =====================================================

-- ---------------------------------------------------
-- 1. Ownership columns
-- ---------------------------------------------------
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.email_templates
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.custom_forms
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON public.email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_forms_user_id ON public.custom_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON public.form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_custom_forms_slug ON public.custom_forms(slug);

-- The earlier migration seeded 3 demo forms with no owner. Under
-- owner-only RLS those rows would become permanently unmanageable
-- (visible publicly, editable/deletable by nobody), so drop them
-- rather than leave orphaned junk in every deployment.
DELETE FROM public.custom_forms WHERE user_id IS NULL;

-- ---------------------------------------------------
-- 2. Drop the old "anyone can do anything" policies
-- ---------------------------------------------------
DROP POLICY IF EXISTS "Allow public read subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public insert subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public update subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public delete subscribers" ON public.subscribers;

DROP POLICY IF EXISTS "Allow public read templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public insert templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public update templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public delete templates" ON public.email_templates;

DROP POLICY IF EXISTS "Allow public read campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Allow public insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Allow public update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Allow public delete campaigns" ON public.campaigns;

DROP POLICY IF EXISTS "Allow public read forms" ON public.custom_forms;
DROP POLICY IF EXISTS "Allow public insert forms" ON public.custom_forms;
DROP POLICY IF EXISTS "Allow public update forms" ON public.custom_forms;
DROP POLICY IF EXISTS "Allow public delete forms" ON public.custom_forms;

DROP POLICY IF EXISTS "Allow public read form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Allow public insert form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Allow public update form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Allow public delete form_submissions" ON public.form_submissions;

-- ---------------------------------------------------
-- 3. Owner-only policies
-- ---------------------------------------------------

-- Subscribers: fully private to the owning user
CREATE POLICY "Users can view own subscribers" ON public.subscribers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscribers" ON public.subscribers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscribers" ON public.subscribers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscribers" ON public.subscribers
  FOR DELETE USING (auth.uid() = user_id);

-- Email templates: fully private
CREATE POLICY "Users can view own templates" ON public.email_templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON public.email_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.email_templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.email_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Campaigns: fully private
CREATE POLICY "Users can view own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Custom forms: definition is publicly readable (a form must be
-- viewable by anonymous visitors at /f/:slug to be filled out),
-- but only the owner can create/edit/delete it.
CREATE POLICY "Anyone can view forms to fill them out" ON public.custom_forms
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own forms" ON public.custom_forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own forms" ON public.custom_forms
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own forms" ON public.custom_forms
  FOR DELETE USING (auth.uid() = user_id);

-- Form submissions: fully private. Anonymous public submission
-- happens through the submit_public_form() RPC below (which runs
-- as SECURITY DEFINER and resolves ownership itself); this INSERT
-- policy only covers the owner testing their own form from inside
-- the app, where auth.uid() is already trustworthy.
CREATE POLICY "Users can view own submissions" ON public.form_submissions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON public.form_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own submissions" ON public.form_submissions
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------
-- 4. Public form submission RPC
-- ---------------------------------------------------
-- Anonymous visitors cannot be trusted to supply the correct
-- user_id directly (a hostile client could attribute junk
-- submissions/subscribers to a form_id + user_id combo it
-- doesn't own, or a user_id that doesn't match the form).
-- This function looks the real owner up server-side from
-- form_id and ignores whatever the caller claims.
CREATE OR REPLACE FUNCTION public.submit_public_form(
  p_form_id UUID,
  p_metadata JSONB,
  p_add_subscriber BOOLEAN DEFAULT false,
  p_subscriber_email TEXT DEFAULT NULL,
  p_subscriber_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_form_name TEXT;
  v_submission_id UUID;
  v_existing_subscriber UUID;
BEGIN
  SELECT user_id, name INTO v_owner_id, v_form_name
  FROM public.custom_forms
  WHERE id = p_form_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Form not found';
  END IF;

  INSERT INTO public.form_submissions (form_id, form_name, metadata, user_id)
  VALUES (p_form_id, v_form_name, p_metadata, v_owner_id)
  RETURNING id INTO v_submission_id;

  IF p_add_subscriber AND p_subscriber_email IS NOT NULL AND p_subscriber_email <> '' THEN
    SELECT id INTO v_existing_subscriber
    FROM public.subscribers
    WHERE email = p_subscriber_email AND user_id = v_owner_id;

    IF v_existing_subscriber IS NULL THEN
      INSERT INTO public.subscribers (email, name, status, user_id, source)
      VALUES (
        p_subscriber_email,
        COALESCE(NULLIF(p_subscriber_name, ''), split_part(p_subscriber_email, '@', 1)),
        'active',
        v_owner_id,
        'Form: ' || COALESCE(v_form_name, 'Untitled')
      );
    END IF;
  END IF;

  RETURN v_submission_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_public_form(UUID, JSONB, BOOLEAN, TEXT, TEXT) TO anon, authenticated;

-- ---------------------------------------------------
-- 5. Audit logging for sensitive tables
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (NEW.user_id, 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.user_id, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (OLD.user_id, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_subscribers ON public.subscribers;
CREATE TRIGGER audit_subscribers
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_custom_forms ON public.custom_forms;
CREATE TRIGGER audit_custom_forms
  AFTER INSERT OR UPDATE OR DELETE ON public.custom_forms
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_email_templates ON public.email_templates;
CREATE TRIGGER audit_email_templates
  AFTER INSERT OR UPDATE OR DELETE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_campaigns ON public.campaigns;
CREATE TRIGGER audit_campaigns
  AFTER INSERT OR UPDATE OR DELETE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- ---------------------------------------------------
-- 6. Per-user record limits (free-tier abuse guard)
-- ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_subscriber_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_limit INTEGER := 10000;
BEGIN
  SELECT COUNT(*) INTO current_count FROM public.subscribers WHERE user_id = NEW.user_id;
  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Subscriber limit reached. Please upgrade your plan.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_subscriber_limit ON public.subscribers;
CREATE TRIGGER enforce_subscriber_limit
  BEFORE INSERT ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.check_subscriber_limit();

CREATE OR REPLACE FUNCTION public.check_form_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_limit INTEGER := 100;
BEGIN
  SELECT COUNT(*) INTO current_count FROM public.custom_forms WHERE user_id = NEW.user_id;
  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Form limit reached. Please upgrade your plan.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_form_limit ON public.custom_forms;
CREATE TRIGGER enforce_form_limit
  BEFORE INSERT ON public.custom_forms
  FOR EACH ROW EXECUTE FUNCTION public.check_form_limit();

-- ---------------------------------------------------
-- 7. Email format guard on subscribers
-- ---------------------------------------------------
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS valid_email;
ALTER TABLE public.subscribers
  ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
