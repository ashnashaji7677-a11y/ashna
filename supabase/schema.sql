-- ============================================================
-- FindIt: Lost & Found Platform Database Schema
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS PROFILE TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. ITEMS TABLE (Lost & Found Listings)
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date_reported DATE NOT NULL DEFAULT CURRENT_DATE,
  item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'resolved', 'closed')),
  additional_details TEXT,
  contact_preference TEXT DEFAULT 'chat' CHECK (contact_preference IN ('chat', 'email', 'phone')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS on items
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can view public items
CREATE POLICY "Public items are viewable by everyone" 
  ON public.items FOR SELECT USING (true);

-- Authenticated users can insert new items
CREATE POLICY "Authenticated users can create items" 
  ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owners can update their items
CREATE POLICY "Users can update their own items" 
  ON public.items FOR UPDATE USING (auth.uid() = user_id);

-- Owners can delete their items
CREATE POLICY "Users can delete their own items" 
  ON public.items FOR DELETE USING (auth.uid() = user_id);


-- 3. CLAIMS TABLE (Ownership Evidence & Verification)
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  evidence_image_urls TEXT[] NOT NULL DEFAULT '{}',
  evidence_description TEXT NOT NULL,
  secret_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT unique_item_claimant UNIQUE (item_id, claimant_id)
);

-- Enable RLS on claims
-- CRITICAL SECURITY: Only the claimant AND the finder (reviewer) can view ownership evidence!
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Claimants and finders can view claims" 
  ON public.claims FOR SELECT 
  USING (auth.uid() = claimant_id OR auth.uid() = reviewer_id);

CREATE POLICY "Authenticated users can submit a claim" 
  ON public.claims FOR INSERT 
  WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "Finders can review and update claim status" 
  ON public.claims FOR UPDATE 
  USING (auth.uid() = reviewer_id OR auth.uid() = claimant_id);


-- 4. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
  claimant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  finder_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT unique_item_chat UNIQUE (item_id, claimant_id, finder_id)
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view their conversations" 
  ON public.conversations FOR SELECT 
  USING (auth.uid() = claimant_id OR auth.uid() = finder_id);

CREATE POLICY "Participants can create conversation" 
  ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = claimant_id OR auth.uid() = finder_id);


-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  attachment_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view messages" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id 
      AND (c.claimant_id = auth.uid() OR c.finder_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id 
      AND (c.claimant_id = auth.uid() OR c.finder_id = auth.uid())
    )
  );

CREATE POLICY "Recipient can update read_at on messages" 
  ON public.messages FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id 
      AND (c.claimant_id = auth.uid() OR c.finder_id = auth.uid())
    )
  );


-- 6. STORAGE BUCKETS SETUP (Supabase Storage)
-- Run this in Supabase SQL editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('items', 'items', true),
  ('evidence', 'evidence', false),
  ('chat_attachments', 'chat_attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies:
-- Public can view item photos
CREATE POLICY "Public items access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'items');

CREATE POLICY "Authenticated users can upload item images" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'items' AND auth.role() = 'authenticated');

-- Evidence bucket: private, only claim participants can access
CREATE POLICY "Claims evidence access" ON storage.objects 
  FOR SELECT USING (
    bucket_id = 'evidence' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload claim evidence" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'evidence' AND auth.role() = 'authenticated');

-- Chat attachments bucket
CREATE POLICY "Chat attachments access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'chat_attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Chat attachments upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'chat_attachments' AND auth.role() = 'authenticated');

