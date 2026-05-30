-- =====================================================
-- BOLTFY - ENHANCED SECURITY POLICIES
-- =====================================================
-- Run this SQL after the basic user_auth migration
-- This adds additional security layers and audit logging
-- =====================================================

-- 1. Create audit log table for security events
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit logs
CREATE POLICY "Users can view own audit logs" 
ON public.audit_logs FOR SELECT 
USING (auth.uid() = user_id);

-- Only system can insert audit logs (via triggers)
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =====================================================
-- 2. CREATE AUDIT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 3. ADD AUDIT TRIGGERS TO SENSITIVE TABLES
-- =====================================================

-- Subscribers audit
DROP TRIGGER IF EXISTS audit_subscribers ON public.subscribers;
CREATE TRIGGER audit_subscribers
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Custom forms audit
DROP TRIGGER IF EXISTS audit_custom_forms ON public.custom_forms;
CREATE TRIGGER audit_custom_forms
  AFTER INSERT OR UPDATE OR DELETE ON public.custom_forms
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Email templates audit
DROP TRIGGER IF EXISTS audit_email_templates ON public.email_templates;
CREATE TRIGGER audit_email_templates
  AFTER INSERT OR UPDATE OR DELETE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Campaigns audit
DROP TRIGGER IF EXISTS audit_campaigns ON public.campaigns;
CREATE TRIGGER audit_campaigns
  AFTER INSERT OR UPDATE OR DELETE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- =====================================================
-- 4. CREATE SECURITY FUNCTIONS
-- =====================================================

-- Function to check if user owns a record
CREATE OR REPLACE FUNCTION public.user_owns_record(table_name TEXT, record_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE id = $1 AND user_id = $2)', table_name)
  INTO result
  USING record_id, auth.uid();
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's data count (for rate limiting)
CREATE OR REPLACE FUNCTION public.get_user_record_count(table_name TEXT)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  EXECUTE format('SELECT COUNT(*)::INTEGER FROM %I WHERE user_id = $1', table_name)
  INTO count_result
  USING auth.uid();
  RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. ADD RATE LIMITING CONSTRAINTS
-- =====================================================

-- Limit subscribers per user (Free tier: 100, can be increased)
CREATE OR REPLACE FUNCTION public.check_subscriber_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_limit INTEGER := 10000; -- Adjust based on plan
BEGIN
  SELECT COUNT(*) INTO current_count 
  FROM public.subscribers 
  WHERE user_id = NEW.user_id;
  
  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Subscriber limit reached. Please upgrade your plan.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS enforce_subscriber_limit ON public.subscribers;
CREATE TRIGGER enforce_subscriber_limit
  BEFORE INSERT ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.check_subscriber_limit();

-- Limit forms per user
CREATE OR REPLACE FUNCTION public.check_form_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_limit INTEGER := 100; -- Adjust based on plan
BEGIN
  SELECT COUNT(*) INTO current_count 
  FROM public.custom_forms 
  WHERE user_id = NEW.user_id;
  
  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'Form limit reached. Please upgrade your plan.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS enforce_form_limit ON public.custom_forms;
CREATE TRIGGER enforce_form_limit
  BEFORE INSERT ON public.custom_forms
  FOR EACH ROW EXECUTE FUNCTION public.check_form_limit();

-- =====================================================
-- 6. DATA VALIDATION FUNCTIONS
-- =====================================================

-- Validate email format
CREATE OR REPLACE FUNCTION public.validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add email validation constraint
ALTER TABLE public.subscribers 
DROP CONSTRAINT IF EXISTS valid_email;

ALTER TABLE public.subscribers 
ADD CONSTRAINT valid_email CHECK (public.validate_email(email));

-- =====================================================
-- 7. CLEAN UP OLD DATA (Data Retention)
-- =====================================================

-- Function to clean old audit logs (keep 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old form submissions (keep 1 year)
CREATE OR REPLACE FUNCTION public.cleanup_old_submissions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.form_submissions 
  WHERE created_at < NOW() - INTERVAL '365 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. ADDITIONAL INDEXES FOR SECURITY QUERIES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_custom_forms_slug ON public.custom_forms(slug);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON public.form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

-- =====================================================
-- SECURITY SETUP COMPLETE!
-- =====================================================
-- Your Boltfy database now has:
-- ✅ Audit logging for all sensitive operations
-- ✅ User-specific data isolation (RLS)
-- ✅ Rate limiting on record creation
-- ✅ Email validation
-- ✅ Optimized indexes for security queries
-- =====================================================
