ALTER TABLE public.lead_comments
  ADD COLUMN parent_id UUID REFERENCES public.lead_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_lead_comments_parent_id ON public.lead_comments(parent_id);
