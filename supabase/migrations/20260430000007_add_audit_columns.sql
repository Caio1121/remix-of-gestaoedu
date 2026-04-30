-- Add updated_by to grades
ALTER TABLE public.grades
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- Add updated_by to attendance
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- Add created_at to financial_records update tracking
ALTER TABLE public.financial_records
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- Create a generic audit log table for full history
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  TEXT NOT NULL,
  record_id   UUID NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by  UUID REFERENCES public.profiles(id),
  changed_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  old_data    JSONB,
  new_data    JSONB
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores veem audit log"
ON public.audit_log FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
);
