-- EL TRILLO - DATABASE SCHEMA (SUPABASE)
-- Designed for absolute privacy, data-savings, and local utility.

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------
-- 1. PROFILES TABLE (Decoupled from Auth metadata)
-- ----------------------------------------------------
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    province VARCHAR(100),
    municipality VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- 2. POSTS TABLE
-- ----------------------------------------------------
CREATE TABLE public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    province VARCHAR(100),
    municipality VARCHAR(100),
    tags TEXT[],
    is_anonymous_post BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts RLS Policies
CREATE POLICY "Posts are viewable by everyone" 
ON public.posts FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create posts" 
ON public.posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts FOR DELETE 
USING (auth.uid() = user_id);

-- ----------------------------------------------------
-- 3. COMMENTS TABLE
-- ----------------------------------------------------
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_anonymous_comment BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments RLS Policies
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE 
USING (auth.uid() = user_id);

-- ----------------------------------------------------
-- 4. GROUPS (PEÑAS) TABLE
-- ----------------------------------------------------
CREATE TABLE public.groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_private BOOLEAN DEFAULT FALSE NOT NULL,
    category VARCHAR(100),
    province VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Groups RLS Policies
CREATE POLICY "Groups are viewable by everyone" 
ON public.groups FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create groups" 
ON public.groups FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" 
ON public.groups FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- ----------------------------------------------------
-- 5. GROUP MEMBERS TABLE
-- ----------------------------------------------------
CREATE TABLE public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' NOT NULL, -- 'admin', 'member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- Enable RLS on Group Members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Group Members RLS Policies
CREATE POLICY "Group members are viewable by everyone" 
ON public.group_members FOR SELECT 
USING (true);

CREATE POLICY "Users can join groups" 
ON public.group_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups or manage membership" 
ON public.group_members FOR DELETE 
USING (auth.uid() = user_id);

-- ----------------------------------------------------
-- 6. MARKETPLACE LISTINGS TABLE
-- ----------------------------------------------------
CREATE TABLE public.marketplace_listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'CUP', -- 'CUP', 'MLC', 'USD'
    category VARCHAR(100),
    image_urls TEXT[], -- Array of compressed image URLs stored in Supabase Storage
    province VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    whatsapp_link TEXT NOT NULL, -- Pre-filled chat link using seller's number
    status VARCHAR(50) DEFAULT 'active' NOT NULL, -- 'active', 'sold'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Marketplace Listings
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Marketplace Listings RLS Policies
CREATE POLICY "Marketplace listings are viewable by everyone" 
ON public.marketplace_listings FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create listings" 
ON public.marketplace_listings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can update their own listings" 
ON public.marketplace_listings FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can delete their own listings" 
ON public.marketplace_listings FOR DELETE 
USING (auth.uid() = user_id);

-- ----------------------------------------------------
-- 7. PRIVATE MESSAGES TABLE
-- ----------------------------------------------------
CREATE TABLE public.private_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 800),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT private_messages_no_self_message CHECK (sender_id <> recipient_id)
);

-- Helpful indexes for loading inboxes and conversation threads quickly
CREATE INDEX private_messages_sender_created_idx
ON public.private_messages (sender_id, created_at DESC);

CREATE INDEX private_messages_recipient_created_idx
ON public.private_messages (recipient_id, created_at DESC);

CREATE INDEX private_messages_thread_created_idx
ON public.private_messages (sender_id, recipient_id, created_at ASC);

-- Enable RLS on Private Messages
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Keep message edits closed; recipients only need to update read_at.
REVOKE UPDATE ON public.private_messages FROM authenticated;
GRANT UPDATE (read_at) ON public.private_messages TO authenticated;

-- Only the sender and recipient can read a private message
CREATE POLICY "Users can read their own private messages"
ON public.private_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Authenticated users can send messages as themselves
CREATE POLICY "Users can send private messages"
ON public.private_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id AND sender_id <> recipient_id);

-- Recipients can mark messages as read
CREATE POLICY "Recipients can mark private messages as read"
ON public.private_messages FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);


-- ====================================================
-- PRIVACY DESIGN: ANONYMOUS VIEWS FOR POSTS & COMMENTS
-- ====================================================
-- These views mask the author details completely if they chose to post/comment anonymously.
-- This ensures that frontend queries consuming these views NEVER receive real user ids or identities.

-- Posts View
CREATE OR REPLACE VIEW public.posts_with_profiles AS
SELECT 
    p.id,
    p.content,
    p.image_url,
    p.province,
    p.municipality,
    p.tags,
    p.is_anonymous_post,
    p.created_at,
    CASE 
        WHEN p.is_anonymous_post = TRUE THEN NULL
        ELSE p.user_id
    END AS user_id,
    CASE 
        WHEN p.is_anonymous_post = TRUE THEN 'Vecino Anónimo'
        ELSE COALESCE(pr.display_name, 'El Trillo User')
    END AS display_name,
    CASE 
        WHEN p.is_anonymous_post = TRUE THEN 'anonimo'
        ELSE pr.username
    END AS username,
    CASE 
        WHEN p.is_anonymous_post = TRUE THEN NULL
        ELSE pr.avatar_url
    END AS avatar_url
FROM public.posts p
LEFT JOIN public.profiles pr ON p.user_id = pr.id;

-- Comments View
CREATE OR REPLACE VIEW public.comments_with_profiles AS
SELECT 
    c.id,
    c.post_id,
    c.content,
    c.is_anonymous_comment,
    c.created_at,
    CASE 
        WHEN c.is_anonymous_comment = TRUE THEN NULL
        ELSE c.user_id
    END AS user_id,
    CASE 
        WHEN c.is_anonymous_comment = TRUE THEN 'Vecino Anónimo'
        ELSE COALESCE(pr.display_name, 'El Trillo User')
    END AS display_name,
    CASE 
        WHEN c.is_anonymous_comment = TRUE THEN 'anonimo'
        ELSE pr.username
    END AS username,
    CASE 
        WHEN c.is_anonymous_comment = TRUE THEN NULL
        ELSE pr.avatar_url
    END AS avatar_url
FROM public.comments c
LEFT JOIN public.profiles pr ON c.user_id = pr.id;


-- ====================================================
-- AUTOMATION: PROFILE CREATION TRIGGER
-- ====================================================
-- Automatically creates a public profile when a new user registers in Supabase Auth.
-- Extracts username from the email if not provided, or uses a random trillador name.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username VARCHAR(50);
BEGIN
  -- Try to get username from metadata, or extract from email, or make a random one
  new_username := COALESCE(
    (new.raw_user_meta_data->>'username'),
    split_part(new.email, '@', 1),
    'trillador_' || substring(md5(random()::text) from 1 for 8)
  );

  -- Handle collision just in case
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) THEN
    new_username := new_username || substring(md5(random()::text) from 1 for 4);
  END IF;

  INSERT INTO public.profiles (id, username, display_name, avatar_url, is_anonymous)
  VALUES (
    new.id,
    new_username,
    COALESCE(new.raw_user_meta_data->>'display_name', new_username),
    COALESCE(new.raw_user_meta_data->>'avatar_url', NULL),
    COALESCE((new.raw_user_meta_data->>'is_anonymous')::boolean, FALSE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution link
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
