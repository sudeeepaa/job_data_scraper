const browserAPIBase = import.meta.env.PUBLIC_API_URL || "";
const serverAPIBase =
    import.meta.env.PRIVATE_API_URL ||
    import.meta.env.PUBLIC_API_URL ||
    "http://127.0.0.1:8080";
const API_BASE = import.meta.env.SSR ? serverAPIBase : browserAPIBase;

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        let detail = `${response.status} ${response.statusText}`;
        try {
            const data = await response.json();
            if (data?.error) {
                detail = data.error;
            }
        } catch {
            // Use the default status text when the body is not JSON.
        }
        throw new Error(detail);
    }

    return response.json();
}

// Job endpoints
export async function fetchJobs(params: Record<string, string | number | undefined> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const query = searchParams.toString();
    return fetchAPI<import("../types").JobListResponse>(`/api/v1/jobs${query ? `?${query}` : ""}`);
}

export async function fetchJob(id: string) {
    return fetchAPI<import("../types").Job>(`/api/v1/jobs/${id}`);
}

export async function fetchFilters() {
    return fetchAPI<import("../types").FilterOptions>("/api/v1/filters");
}

// Company endpoints
export async function fetchCompanies(query?: string) {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    return fetchAPI<import("../types").CompanyListResponse>(`/api/v1/companies${params}`);
}

export async function fetchCompany(slug: string) {
    return fetchAPI<import("../types").CompanyDetailResponse>(`/api/v1/companies/${slug}`);
}

// Analytics endpoints
export async function fetchTopSkills(limit = 20) {
    return fetchAPI<{ data: import("../types").SkillCount[] }>(`/api/v1/analytics/skills?limit=${limit}`);
}

export async function fetchAnalyticsSummary() {
    return fetchAPI<import("../types").AnalyticsSummary>("/api/v1/analytics/summary");
}

export async function fetchMarketTrends(limit = 10) {
    return fetchAPI<{ data: import("../types").MarketTrend[] }>(`/api/v1/analytics/trends?limit=${limit}`);
}

export async function fetchSourceDistribution() {
    return fetchAPI<{ data: import("../types").SourceDistribution[] }>("/api/v1/analytics/sources");
}

export async function fetchSalaryStats() {
    return fetchAPI<import("../types").SalaryStats>("/api/v1/analytics/salary");
}

export async function refreshTrends() {
    return fetchAPI<{ message: string }>("/api/v1/analytics/refresh", { method: "POST" });
}

// Auth endpoints
export async function register(email: string, password: string, name: string) {
    return fetchAPI<import("../types").AuthResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
    });
}

export async function login(email: string, password: string) {
    return fetchAPI<import("../types").AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export async function fetchProfile(token: string) {
    return fetchAPI<import("../types").UserProfile>("/api/v1/me/", {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function fetchSavedJobs(token: string) {
    return fetchAPI<import("../types").SavedJobsResponse>("/api/v1/me/saved-jobs", {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function saveJob(token: string, jobId: string) {
    return fetchAPI<{ message: string }>(`/api/v1/me/saved-jobs/${jobId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function unsaveJob(token: string, jobId: string) {
    return fetchAPI<{ message: string }>(`/api/v1/me/saved-jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
}
