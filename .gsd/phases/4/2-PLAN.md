---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Auth Pages + Save Job Button

## Objective
Implement the user authentication UI (register, login, profile pages) and the save/bookmark job feature. Users can create an account, log in, view their profile with saved jobs, and bookmark/unbookmark jobs from the job listing and detail pages.

## Context
- `frontend/src/lib/api.ts` — Auth API functions (added in Plan 4.1)
- `frontend/src/types/index.ts` — Auth types (added in Plan 4.1)  
- `frontend/src/pages/jobs/[id].astro` — Job detail page (needs save button)
- `frontend/src/components/jobs/JobCard.astro` — Job card component (needs save button)
- `frontend/src/layouts/PageLayout.astro` — Page layout (header needs login/profile link)
- `frontend/src/components/common/Header.astro` — Header component

## Tasks

<task type="auto">
  <name>Create auth pages (register, login, profile)</name>
  <files>
    - frontend/src/pages/auth/register.astro (NEW)
    - frontend/src/pages/auth/login.astro (NEW)
    - frontend/src/pages/auth/profile.astro (NEW)
    - frontend/src/components/islands/AuthForm.tsx (NEW)
    - frontend/src/components/islands/ProfileView.tsx (NEW)
    - frontend/src/lib/auth.ts (NEW)
  </files>
  <action>
    1. **Create `frontend/src/lib/auth.ts`** — Client-side auth state management:
       - `getToken()` → Reads JWT from `localStorage`
       - `setToken(token)` → Stores JWT in `localStorage`
       - `clearToken()` → Removes JWT from `localStorage`
       - `isLoggedIn()` → Returns boolean based on token existence
       - `getAuthHeader()` → Returns `{ Authorization: 'Bearer <token>' }` or empty

    2. **Create `AuthForm.tsx`** — Preact island:
       - Two modes: `register` and `login`
       - Form fields: email, password (+ name for register)
       - Calls `register()` or `login()` from API client
       - On success: stores token via `auth.ts`, redirects to `/auth/profile`
       - On error: displays error message from API response
       - Styled with existing Tailwind dark/light theme classes

    3. **Create register page** (`/auth/register`) using PageLayout:
       - Centered card with `<AuthForm mode="register" client:load />`
       - Link to login page

    4. **Create login page** (`/auth/login`) using PageLayout:
       - Centered card with `<AuthForm mode="login" client:load />`
       - Link to register page

    5. **Create `ProfileView.tsx`** — Preact island:
       - Fetches user profile and saved jobs on mount (using token from auth.ts)
       - Displays user info (name, email, member since date)
       - Lists saved jobs with links to job detail pages
       - "Unsave" button on each saved job
       - "Logout" button that clears token and redirects to home

    6. **Create profile page** (`/auth/profile`) using PageLayout:
       - `<ProfileView client:load />`
       - If no token, show "please log in" message + link to login

    DO NOT use server-side session management — use client-side JWT only.
    DO NOT add any external auth libraries.
  </action>
  <verify>
    ```bash
    cd frontend && npm run build 2>&1 | tail -5 && echo "BUILD OK"
    ```
  </verify>
  <done>
    - Register page renders form, calls API, stores token
    - Login page renders form, calls API, stores token
    - Profile page shows user info and saved jobs
    - Logout clears token and redirects
    - Build passes
  </done>
</task>

<task type="auto">
  <name>Add save button + auth links to header</name>
  <files>
    - frontend/src/components/islands/SaveJobButton.tsx (NEW)
    - frontend/src/components/islands/AuthNav.tsx (NEW)
    - frontend/src/components/common/Header.astro (MODIFY)
    - frontend/src/pages/jobs/[id].astro (MODIFY)
    - frontend/src/components/jobs/JobCard.astro (MODIFY)
  </files>
  <action>
    1. **Create `SaveJobButton.tsx`** — Preact island:
       - Props: `{ jobId: string; }`
       - Checks `isLoggedIn()` from auth.ts
       - If not logged in: shows heart outline, clicking redirects to `/auth/login`
       - If logged in: toggles saved state via `saveJob()` / `unsaveJob()` API calls
       - Heart icon: filled when saved, outline when not
       - Small loading spinner during API call

    2. **Create `AuthNav.tsx`** — Preact island:
       - Checks `isLoggedIn()` on mount
       - If logged in: shows "Profile" link to `/auth/profile`
       - If not logged in: shows "Login" link to `/auth/login`

    3. **Update `Header.astro`:**
       - Add `<AuthNav client:load />` to the right side of the header nav

    4. **Update `jobs/[id].astro`:**
       - Add `<SaveJobButton jobId={job.id} client:load />` next to the Apply Now button

    5. **Update `JobCard.astro`:**
       - Add `<SaveJobButton jobId={job.id} client:load />` in the card footer area

    DO NOT break existing job card or detail page layouts.
    DO NOT add auth protection to SSR pages — auth is client-side only.
  </action>
  <verify>
    ```bash
    cd frontend && npm run build 2>&1 | tail -5 && echo "BUILD OK"
    ```
  </verify>
  <done>
    - Save button appears on job cards and detail pages
    - Header shows Login/Profile link based on auth state
    - Save button toggles saved state when logged in
    - Save button redirects to login when not logged in
    - Build passes
  </done>
</task>

## Success Criteria
- [ ] Register page: form → API call → store token → redirect to profile
- [ ] Login page: form → API call → store token → redirect to profile
- [ ] Profile page: shows user info + saved jobs list
- [ ] Logout clears token and redirects home
- [ ] Save button on job cards toggles bookmark state
- [ ] Save button on job detail toggles bookmark state
- [ ] Header shows Login/Profile based on auth state
- [ ] Auth redirects to login for unauthenticated users
