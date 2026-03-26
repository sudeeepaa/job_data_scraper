-- 003_application_tracker.sql
-- Table to track job applications for users

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_id TEXT, -- Can be null for manual entries
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'wishlist', -- wishlist, applied, interviewing, offered, rejected
    notes TEXT DEFAULT '',
    applied_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
