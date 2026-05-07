-- ============================================================
-- Migration: Lead Comments + Notifications (final, idempotent)
-- ============================================================

-- ─── 1. lead_comments ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lead_comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID        NOT NULL REFERENCES public.lead_logs(id)  ON DELETE CASCADE,
  author_id   UUID        NOT NULL REFERENCES public.users(id)      ON DELETE CASCADE,
  content     TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_comments_lead_id    ON public.lead_comments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_comments_author_id  ON public.lead_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_lead_comments_created_at ON public.lead_comments(created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_comments_updated_at ON public.lead_comments;
CREATE TRIGGER trg_lead_comments_updated_at
  BEFORE UPDATE ON public.lead_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.lead_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_comments' AND policyname='lead_comments_select') THEN
    CREATE POLICY "lead_comments_select" ON public.lead_comments
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_comments' AND policyname='lead_comments_insert') THEN
    CREATE POLICY "lead_comments_insert" ON public.lead_comments
      FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_comments' AND policyname='lead_comments_delete') THEN
    CREATE POLICY "lead_comments_delete" ON public.lead_comments
      FOR DELETE USING (auth.uid() = author_id);
  END IF;
END $$;


-- ─── 2. notifications ─────────────────────────────────────────
-- Table already exists with: id, user_id, from_user_id, comment_id,
--   lead_id, message, is_read, created_at
-- We add the two missing columns needed for our feature.

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS type  TEXT NOT NULL DEFAULT 'mention'
    CHECK (type IN ('mention', 'comment', 'system')),
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read    ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='notifications_select') THEN
    CREATE POLICY "notifications_select" ON public.notifications
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='notifications_insert_service') THEN
    CREATE POLICY "notifications_insert_service" ON public.notifications
      FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='notifications_update') THEN
    CREATE POLICY "notifications_update" ON public.notifications
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- Done
-- ============================================================
