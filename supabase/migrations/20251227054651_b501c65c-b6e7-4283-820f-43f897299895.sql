-- Create custom forms table
CREATE TABLE public.custom_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read forms" ON public.custom_forms FOR SELECT USING (true);
CREATE POLICY "Allow public insert forms" ON public.custom_forms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update forms" ON public.custom_forms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete forms" ON public.custom_forms FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_custom_forms_updated_at
  BEFORE UPDATE ON public.custom_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add form_id reference to form_submissions
ALTER TABLE public.form_submissions ADD COLUMN form_id UUID REFERENCES public.custom_forms(id) ON DELETE SET NULL;

-- Insert default forms
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
]'::jsonb);