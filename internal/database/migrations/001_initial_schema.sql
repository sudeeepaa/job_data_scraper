-- 001_initial_schema.sql
-- JobPulse database schema

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table (unified model, stores cached API results)
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    external_id TEXT DEFAULT '',
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL,
    company_slug TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    posted_at DATETIME,
    expires_at DATETIME,
    source TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL DEFAULT '',
    skills TEXT DEFAULT '[]',
    is_remote BOOLEAN DEFAULT FALSE,
    employment_type TEXT DEFAULT 'full-time',
    experience_level TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_company_slug ON jobs(company_slug);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT DEFAULT '',
    description TEXT DEFAULT '',
    website TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    job_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Search cache table (tracks freshness for hybrid caching)
CREATE TABLE IF NOT EXISTS search_cache (
    query_hash TEXT PRIMARY KEY,
    query_text TEXT NOT NULL,
    filters TEXT DEFAULT '{}',
    result_count INTEGER DEFAULT 0,
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Saved jobs (user bookmarks)
CREATE TABLE IF NOT EXISTS saved_jobs (
    user_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Market trends (aggregated data from searches)
CREATE TABLE IF NOT EXISTS market_trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name TEXT NOT NULL,
    mention_count INTEGER DEFAULT 0,
    avg_salary_min INTEGER,
    avg_salary_max INTEGER,
    snapshot_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_market_trends_date ON market_trends(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_market_trends_skill ON market_trends(skill_name);
