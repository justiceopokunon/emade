-- E-MADE Database Schema for Production
-- Run this in your Neon database console after creating the database

-- Site configuration table (stores hero message, stats, navigation, etc.)
CREATE TABLE IF NOT EXISTS site_data (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  author VARCHAR(255),
  category VARCHAR(100),
  time VARCHAR(50),
  status VARCHAR(50) DEFAULT 'published',
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DIY projects table
CREATE TABLE IF NOT EXISTS diy_projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  difficulty VARCHAR(50),
  time VARCHAR(100),
  outcome TEXT,
  materials TEXT[] DEFAULT '{}',
  steps JSONB DEFAULT '[]',
  safety_tips TEXT[] DEFAULT '{}',
  image_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  message_id VARCHAR(255) UNIQUE NOT NULL,
  story_slug VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reply_to VARCHAR(255),
  reactions JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'approved',
  moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  focus TEXT,
  avatar TEXT,
  image_url TEXT,
  socials JSONB DEFAULT '[]',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery tiles table
CREATE TABLE IF NOT EXISTS gallery_tiles (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  src TEXT NOT NULL,
  size VARCHAR(20) DEFAULT 'square',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact channels table  
CREATE TABLE IF NOT EXISTS contact_channels (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  detail TEXT NOT NULL,
  href TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_chat_story_slug ON chat_messages(story_slug);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diy_name ON diy_projects(name);
CREATE INDEX IF NOT EXISTS idx_team_order ON team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery_tiles(display_order);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diy_updated_at BEFORE UPDATE ON diy_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery_tiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
