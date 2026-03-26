package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/samuelshine/job-data-scraper/internal/domain"
)

// TrendsRepo provides database-backed access to market trend data.
type TrendsRepo struct {
	db *sqlx.DB
}

// NewTrendsRepo creates a new trends repository.
func NewTrendsRepo(db *sqlx.DB) *TrendsRepo {
	return &TrendsRepo{db: db}
}

// ComputeAndStoreSnapshot analyzes the jobs table and stores a market trends snapshot.
func (r *TrendsRepo) ComputeAndStoreSnapshot(ctx context.Context) error {
	today := time.Now().Format("2006-01-02")

	// 1. Parse all skills from jobs and count mentions + collect salary data per skill
	type jobSkillRow struct {
		Skills    string `db:"skills"`
		SalaryMin *int   `db:"salary_min"`
		SalaryMax *int   `db:"salary_max"`
	}
	var rows []jobSkillRow
	err := r.db.SelectContext(ctx, &rows, "SELECT skills, salary_min, salary_max FROM jobs")
	if err != nil {
		return fmt.Errorf("failed to query jobs for trends: %w", err)
	}

	type skillAgg struct {
		count       int
		salaryMins  []int
		salaryMaxes []int
	}
	skills := make(map[string]*skillAgg)

	for _, row := range rows {
		var skillList []string
		if err := json.Unmarshal([]byte(row.Skills), &skillList); err != nil {
			continue
		}
		for _, skill := range skillList {
			skill = strings.TrimSpace(skill)
			if skill == "" {
				continue
			}
			key := strings.ToLower(skill)
			if _, ok := skills[key]; !ok {
				skills[key] = &skillAgg{}
			}
			agg := skills[key]
			agg.count++
			if row.SalaryMin != nil {
				agg.salaryMins = append(agg.salaryMins, *row.SalaryMin)
			}
			if row.SalaryMax != nil {
				agg.salaryMaxes = append(agg.salaryMaxes, *row.SalaryMax)
			}
		}
	}

	// 2. Delete existing snapshot for today (replace)
	_, err = r.db.ExecContext(ctx, "DELETE FROM market_trends WHERE snapshot_date = ?", today)
	if err != nil {
		return fmt.Errorf("failed to clear old snapshot: %w", err)
	}

	// 3. Insert new snapshot
	stmt, err := r.db.PrepareContext(ctx,
		"INSERT INTO market_trends (skill_name, mention_count, avg_salary_min, avg_salary_max, snapshot_date) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare insert: %w", err)
	}
	defer stmt.Close()

	for name, agg := range skills {
		var avgMin, avgMax *int
		if len(agg.salaryMins) > 0 {
			sum := 0
			for _, v := range agg.salaryMins {
				sum += v
			}
			avg := sum / len(agg.salaryMins)
			avgMin = &avg
		}
		if len(agg.salaryMaxes) > 0 {
			sum := 0
			for _, v := range agg.salaryMaxes {
				sum += v
			}
			avg := sum / len(agg.salaryMaxes)
			avgMax = &avg
		}
		if _, err := stmt.ExecContext(ctx, name, agg.count, avgMin, avgMax, today); err != nil {
			return fmt.Errorf("failed to insert trend for %s: %w", name, err)
		}
	}

	return nil
}

// GetTrends returns the latest snapshot's market trends, ordered by mention_count DESC.
func (r *TrendsRepo) GetTrends(ctx context.Context, limit int) ([]domain.MarketTrend, error) {
	if limit <= 0 {
		limit = 10
	}

	var trends []domain.MarketTrend
	err := r.db.SelectContext(ctx, &trends, `
		SELECT skill_name, mention_count, avg_salary_min, avg_salary_max, snapshot_date
		FROM market_trends
		WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM market_trends)
		ORDER BY mention_count DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get trends: %w", err)
	}
	if trends == nil {
		trends = []domain.MarketTrend{}
	}
	return trends, nil
}

// GetSourceDistribution returns job counts grouped by source.
func (r *TrendsRepo) GetSourceDistribution(ctx context.Context) ([]domain.SourceDistribution, error) {
	var dist []domain.SourceDistribution
	err := r.db.SelectContext(ctx, &dist, `
		SELECT source, COUNT(*) as count
		FROM jobs
		GROUP BY source
		ORDER BY count DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get source distribution: %w", err)
	}
	if dist == nil {
		dist = []domain.SourceDistribution{}
	}
	return dist, nil
}

// GetSalaryStats returns aggregate salary statistics across all jobs.
func (r *TrendsRepo) GetSalaryStats(ctx context.Context) (domain.SalaryStats, error) {
	var stats domain.SalaryStats

	err := r.db.GetContext(ctx, &stats, `
		SELECT
			COALESCE(MIN(salary_min), 0) as min_salary,
			COALESCE(MAX(salary_max), 0) as max_salary,
			COALESCE(CAST(AVG(CASE WHEN salary_min > 0 THEN salary_min END) AS INTEGER), 0) as avg_min,
			COALESCE(CAST(AVG(CASE WHEN salary_max > 0 THEN salary_max END) AS INTEGER), 0) as avg_max,
			COUNT(*) as total_with_salary
		FROM jobs
		WHERE (salary_min > 0 OR salary_max > 0)
		  AND source != 'seed'
	`)
	if err != nil {
		return stats, fmt.Errorf("failed to get salary stats: %w", err)
	}

	// Compute median from salary_min values
	var salaries []int
	err = r.db.SelectContext(ctx, &salaries, `
		SELECT salary_min FROM jobs WHERE salary_min IS NOT NULL ORDER BY salary_min
	`)
	if err == nil && len(salaries) > 0 {
		mid := len(salaries) / 2
		if len(salaries)%2 == 0 {
			stats.MedianSalary = (salaries[mid-1] + salaries[mid]) / 2
		} else {
			stats.MedianSalary = salaries[mid]
		}
	}

	return stats, nil
}
