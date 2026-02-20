## Plan 4.1 Summary: API Client + Types + Analytics Upgrade

### Completed
- Added 8 new TypeScript types to `types/index.ts`: `MarketTrend`, `SourceDistribution`, `SalaryStats`, `AuthResponse`, `UserProfile`, `SavedJobEntry`, `APIError`
- Added 10 new API functions to `api.ts`: `fetchMarketTrends`, `fetchSourceDistribution`, `fetchSalaryStats`, `refreshTrends`, `register`, `login`, `fetchProfile`, `fetchSavedJobs`, `saveJob`, `unsaveJob`
- Created `TrendsChart.tsx` Preact island — horizontal bar chart with salary tooltips
- Created `SourcesChart.tsx` Preact island — doughnut chart with percentage tooltips
- Upgraded `analytics.astro` with salary stats cards, trends chart, sources chart, insights section, and refresh button

### Verification
- `npm run build` passes with all islands compiled
- Backend endpoints return correct data (tested with curl)
