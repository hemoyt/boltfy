-- =====================================================
-- FORM FLOW - COMPLETE DATABASE SETUP
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to set up
-- all tables, policies, and default data.
-- =====================================================

-- 1. Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'unsubscribed')),
  source TEXT DEFAULT 'Manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  preview_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  recipients_count INTEGER DEFAULT 0,
  open_rate NUMERIC(5,2),
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create custom_forms table
CREATE TABLE IF NOT EXISTS public.custom_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create form_submissions table
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE CASCADE,
  form_id UUID REFERENCES public.custom_forms(id) ON DELETE SET NULL,
  form_name TEXT DEFAULT 'default',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE POLICIES (Public access for demo - add auth in production!)
-- =====================================================

-- Subscribers policies
DROP POLICY IF EXISTS "Allow public read subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public insert subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public update subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public delete subscribers" ON public.subscribers;

CREATE POLICY "Allow public read subscribers" ON public.subscribers FOR SELECT USING (true);
CREATE POLICY "Allow public insert subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update subscribers" ON public.subscribers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete subscribers" ON public.subscribers FOR DELETE USING (true);

-- Email templates policies
DROP POLICY IF EXISTS "Allow public read templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public insert templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public update templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow public delete templates" ON public.email_templates;

CREATE POLICY "Allow public read templates" ON public.email_templates FOR SELECT USING (true);
CREATE POLICY "Allow public insert templates" ON public.email_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update templates" ON public.email_templates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete templates" ON public.email_templates FOR DELETE USING (true);

-- Campaigns policies
DROP POLICY IF EXISTS "Allow public read campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Allow public insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Allow public update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Allow public delete campaigns" ON public.campaigns;

CREATE POLICY "Allow public read campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public insert campaigns" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update campaigns" ON public.campaigns FOR UPDATE USING (true);
CREATE POLICY "Allow public delete campaigns" ON public.campaigns FOR DELETE USING (true);

-- Custom forms policies
DROP POLICY IF EXISTS "Allow public read forms" ON public.custom_forms;
DROP POLICY IF EXISTS "Allow public insert forms" ON public.custom_forms;
DROP POLICY IF EXISTS "Allow public update forms" ON public.custom_forms;
DROP POLICY IF EXISTS "Allow public delete forms" ON public.custom_forms;

CREATE POLICY "Allow public read forms" ON public.custom_forms FOR SELECT USING (true);
CREATE POLICY "Allow public insert forms" ON public.custom_forms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update forms" ON public.custom_forms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete forms" ON public.custom_forms FOR DELETE USING (true);

-- Form submissions policies
DROP POLICY IF EXISTS "Allow public read form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Allow public insert form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Allow public update form_submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Allow public delete form_submissions" ON public.form_submissions;

CREATE POLICY "Allow public read form_submissions" ON public.form_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert form_submissions" ON public.form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update form_submissions" ON public.form_submissions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete form_submissions" ON public.form_submissions FOR DELETE USING (true);

-- =====================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
DROP TRIGGER IF EXISTS update_templates_updated_at ON public.email_templates;
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
DROP TRIGGER IF EXISTS update_custom_forms_updated_at ON public.custom_forms;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_forms_updated_at
  BEFORE UPDATE ON public.custom_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Default forms
INSERT INTO public.custom_forms (name, slug, description, fields) VALUES
('Contact Form', 'contact-form', 'General contact form for inquiries', '[
  {"id": "name", "type": "text", "label": "Full Name", "required": true, "placeholder": "Enter your name"},
  {"id": "email", "type": "email", "label": "Email Address", "required": true, "placeholder": "your@email.com"},
  {"id": "message", "type": "textarea", "label": "Message", "required": true, "placeholder": "How can we help you?"}
]'::jsonb),
('Booking Form', 'booking-form', 'Appointment and booking requests', '[
  {"id": "name", "type": "text", "label": "Full Name", "required": true, "placeholder": "Enter your name"},
  {"id": "email", "type": "email", "label": "Email Address", "required": true, "placeholder": "your@email.com"},
  {"id": "phone", "type": "tel", "label": "Phone Number", "required": false, "placeholder": "+1 (555) 000-0000"},
  {"id": "date", "type": "date", "label": "Preferred Date", "required": true},
  {"id": "time", "type": "select", "label": "Preferred Time", "required": true, "options": ["Morning (9am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-8pm)"]},
  {"id": "notes", "type": "textarea", "label": "Additional Notes", "required": false, "placeholder": "Any special requirements?"}
]'::jsonb),
('Get Offer Form', 'get-offer-form', 'Request a quote or special offer', '[
  {"id": "name", "type": "text", "label": "Full Name", "required": true, "placeholder": "Enter your name"},
  {"id": "email", "type": "email", "label": "Email Address", "required": true, "placeholder": "your@email.com"},
  {"id": "company", "type": "text", "label": "Company Name", "required": false, "placeholder": "Your company"},
  {"id": "service", "type": "select", "label": "Service Interested In", "required": true, "options": ["Basic Plan", "Pro Plan", "Enterprise Plan", "Custom Solution"]},
  {"id": "budget", "type": "select", "label": "Budget Range", "required": false, "options": ["Under $1,000", "$1,000 - $5,000", "$5,000 - $10,000", "$10,000+"]},
  {"id": "details", "type": "textarea", "label": "Project Details", "required": true, "placeholder": "Tell us about your project..."}
]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Sample subscribers (optional - remove if you don't want demo data)
INSERT INTO public.subscribers (email, name, status, source) VALUES
('john@example.com', 'John Doe', 'active', 'Website'),
('jane@example.com', 'Jane Smith', 'active', 'Manual'),
('bob@example.com', 'Bob Johnson', 'pending', 'Form')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready. Update your .env file
-- with your Supabase credentials and restart the app.
-- =====================================================
