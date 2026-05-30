-- =====================================================
-- ADD USER_ID TO ALL TABLES FOR DATA ISOLATION
-- =====================================================
-- Run this SQL in your Supabase SQL Editor AFTER enabling
-- authentication in your project.
-- =====================================================

-- 1. Add user_id column to subscribers
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add user_id column to email_templates
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Add user_id column to campaigns
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Add user_id column to custom_forms
ALTER TABLE public.custom_forms 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Add user_id column to form_submissions
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- UPDATE RLS POLICIES FOR USER-SPECIFIC DATA
-- =====================================================

-- Drop old policies
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

-- =====================================================
-- CREATE NEW USER-SPECIFIC POLICIES
-- =====================================================

-- Subscribers: Users can only access their own subscribers
CREATE POLICY "Users can view own subscribers" 
ON public.subscribers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscribers" 
ON public.subscribers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscribers" 
ON public.subscribers FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscribers" 
ON public.subscribers FOR DELETE 
USING (auth.uid() = user_id);

-- Email Templates: Users can only access their own templates
CREATE POLICY "Users can view own templates" 
ON public.email_templates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" 
ON public.email_templates FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" 
ON public.email_templates FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" 
ON public.email_templates FOR DELETE 
USING (auth.uid() = user_id);

-- Campaigns: Users can only access their own campaigns
CREATE POLICY "Users can view own campaigns" 
ON public.campaigns FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" 
ON public.campaigns FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" 
ON public.campaigns FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" 
ON public.campaigns FOR DELETE 
USING (auth.uid() = user_id);

-- Custom Forms: Users can only access their own forms
CREATE POLICY "Users can view own forms" 
ON public.custom_forms FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forms" 
ON public.custom_forms FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms" 
ON public.custom_forms FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms" 
ON public.custom_forms FOR DELETE 
USING (auth.uid() = user_id);

-- Form Submissions: Users can only access their own submissions
CREATE POLICY "Users can view own submissions" 
ON public.form_submissions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" 
ON public.form_submissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" 
ON public.form_submissions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own submissions" 
ON public.form_submissions FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- OPTIONAL: Allow public form submissions (for embedded forms)
-- Uncomment if you want external users to submit forms
-- =====================================================
-- CREATE POLICY "Anyone can submit to public forms" 
-- ON public.form_submissions FOR INSERT 
-- WITH CHECK (true);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON public.email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_forms_user_id ON public.custom_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON public.form_submissions(user_id);

-- =====================================================
-- DONE! Your database now has user-specific data isolation.
-- =====================================================
