-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    banner_image TEXT,
    published BOOLEAN DEFAULT false,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    podcast_url TEXT,
    podcast_duration_seconds INT,
    podcast_size_bytes BIGINT,
    podcast_transcript_url TEXT,
    podcast_published BOOLEAN DEFAULT false,
    youtube_url TEXT,
    youtube_embed_title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Podcast Chapters Table
CREATE TABLE IF NOT EXISTS podcast_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
    start_seconds INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blog Media Views Table (Analytics)
CREATE TABLE IF NOT EXISTS blog_media_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('article', 'podcast', 'youtube')),
    client_id TEXT, -- Cookie or UUID
    event_type VARCHAR(20) CHECK (event_type IN ('start', 'progress', 'complete')),
    position_seconds INT,
    created_at TIMESTAMP DEFAULT NOW()
);
