
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Workspace Documents + Calendar Events Tables
-- ═══════════════════════════════════════════════════════════════

-- Documents table (covers docs, sheets, slides/decks)
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  document_type TEXT NOT NULL DEFAULT 'document' CHECK (document_type IN ('document','proposal','report','boardroom-packet','note','sheet','slide','deck')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','approved','published','archived','ready','presented')),
  author TEXT DEFAULT 'You',
  content TEXT DEFAULT '',
  privacy TEXT DEFAULT 'personal' CHECK (privacy IN ('personal','team','client','public','restricted')),
  governed BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  linked_entity TEXT,
  linked_workflow TEXT,
  linked_domain TEXT,
  columns_config JSONB DEFAULT '[]',
  data_rows JSONB DEFAULT '[]',
  formulas JSONB DEFAULT '{}',
  slides JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_documents_user_type ON public.documents (user_id, document_type);

-- Calendar Events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TEXT,
  end_time TEXT,
  domain TEXT DEFAULT 'personal' CHECK (domain IN ('personal','business','household','finance')),
  event_type TEXT DEFAULT 'task' CHECK (event_type IN ('meeting','task','reminder','appointment','deadline','travel')),
  location TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  overlap_warning BOOLEAN DEFAULT false,
  recurrence TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar events" ON public.calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own calendar events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar events" ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar events" ON public.calendar_events FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_calendar_events_user_date ON public.calendar_events (user_id, event_date);
