## Plan 4.2 Summary: Auth Pages + Save Job Button

### Completed
- Created `lib/auth.ts` — localStorage JWT management (`getToken`, `setToken`, `clearToken`, `isLoggedIn`, `getAuthHeader`)
- Created `AuthForm.tsx` — Preact island with register/login modes, error handling, loading states
- Created `ProfileView.tsx` — Preact island showing user info, saved jobs list, unsave/logout
- Created `SaveJobButton.tsx` — Preact island with heart toggle, auth-redirect, loading spinner
- Created `AuthNav.tsx` — Preact island showing Sign In / Profile link based on auth state
- Created auth pages: `auth/register.astro`, `auth/login.astro`, `auth/profile.astro`
- Wired `AuthNav` into `Header.astro` (desktop + mobile)
- Wired `SaveJobButton` into `JobCard.astro` and `jobs/[id].astro`

### Verification
- `npm run build` passes — all 7 islands compile
- Auth register/login endpoints return correct responses
