---
phase: 4
plan: 3
wave: 2
---

# Plan 4.3: UI Polish + Dark Mode + Responsive Audit

## Objective
Polish the entire frontend for a portfolio-worthy appearance. Ensure dark mode works consistently across all pages (including new auth pages), add smooth transitions, verify responsive design on mobile, and add loading states where data is being fetched.

## Context
- `frontend/src/styles/global.css` — Global CSS (may need dark mode fixes)
- `frontend/src/components/islands/ThemeToggle.tsx` — Existing theme toggle
- `frontend/src/layouts/PageLayout.astro` — Main layout wrapper
- All pages created in Plans 4.1 and 4.2

## Tasks

<task type="auto">
  <name>Dark mode audit + transitions + loading states</name>
  <files>
    - frontend/src/styles/global.css (MODIFY)
    - frontend/src/pages/index.astro (MODIFY — if needed)
    - frontend/src/layouts/PageLayout.astro (MODIFY — if needed)
    - frontend/src/components/common/Header.astro (MODIFY — if needed)
    - frontend/src/components/common/Footer.astro (MODIFY — if needed)
  </files>
  <action>
    1. **Global CSS improvements:**
       - Ensure `dark:` variants exist for ALL background, text, and border colors
       - Add smooth page transition: `html { scroll-behavior: smooth; }`
       - Add subtle card hover effect: `transform: translateY(-2px)` with transition
       - Ensure consistent border-radius (rounded-xl everywhere)
       - Add focus ring styles for accessibility
       - Ensure font-family stack includes Inter or similar modern font from Google Fonts

    2. **Loading states:**
       - Add a shimmer/skeleton loading animation in global.css
       - Use existing error patterns where needed (red alert boxes)

    3. **Responsive audit:**
       - Check all pages render properly at: mobile (375), tablet (768), desktop (1024+)
       - Ensure filter panel collapses on mobile
       - Ensure header nav is mobile-friendly (it may already have a hamburger menu)

    4. **Consistency pass:**
       - Ensure all "Apply Now" and source badge styles are consistent
       - Verify analytics charts resize properly on mobile
       - Check all links have hover states

    DO NOT change page structure or data fetching logic.
    DO NOT add new dependencies.
    Focus on CSS/styling adjustments only.
  </action>
  <verify>
    ```bash
    cd frontend && npm run build 2>&1 | tail -3 && echo "BUILD OK"
    # Manual: start dev server, check dark mode toggle on:
    #   - Home page (hero, stats, features)
    #   - Jobs list (cards, filters, pagination)
    #   - Job detail (salary, apply button, skills)
    #   - Analytics (charts, stats cards)
    #   - Auth pages (forms, profile)
    ```
  </verify>
  <done>
    - Dark mode works on ALL pages including auth
    - Cards have hover effects
    - Loading skeleton animation exists in CSS
    - Build passes
    - Font stack includes modern font
  </done>
</task>

## Success Criteria
- [ ] Dark mode renders correctly on all pages
- [ ] Theme toggle persists preference
- [ ] Cards have subtle hover animation
- [ ] Loading skeleton animation available in CSS
- [ ] All pages responsive at 375, 768, 1024+ widths
- [ ] Modern font (Inter or similar) applied globally
- [ ] Build passes
