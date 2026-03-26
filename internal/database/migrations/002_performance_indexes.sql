-- 002_performance_indexes.sql
-- Additional indexes for frequently filtered columns

-- Jobs table: location filter
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);

-- Jobs table: remote filter
CREATE INDEX IF NOT EXISTS idx_jobs_is_remote ON jobs(is_remote);

-- Jobs table: salary range filter + sorting
CREATE INDEX IF NOT EXISTS idx_jobs_salary_min ON jobs(salary_min);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_max ON jobs(salary_max);

-- Jobs table: employment type filter
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);

-- Saved jobs: user lookup
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);

-- Users: email lookup (already has UNIQUE constraint, this is explicit)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
