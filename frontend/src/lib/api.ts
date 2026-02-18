// API client for fetching data from Go backend

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
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
    return fetchAPI<import('../types').JobListResponse>(`/api/v1/jobs${query ? `?${query}` : ''}`);
}

export async function fetchJob(id: string) {
    return fetchAPI<import('../types').Job>(`/api/v1/jobs/${id}`);
}

export async function fetchFilters() {
    return fetchAPI<import('../types').FilterOptions>('/api/v1/filters');
}

// Company endpoints
export async function fetchCompanies(query?: string) {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    return fetchAPI<import('../types').CompanyListResponse>(`/api/v1/companies${params}`);
}

export async function fetchCompany(slug: string) {
    return fetchAPI<import('../types').CompanyDetailResponse>(`/api/v1/companies/${slug}`);
}

// Analytics endpoints
export async function fetchTopSkills(limit = 20) {
    return fetchAPI<{ data: import('../types').SkillCount[] }>(`/api/v1/analytics/skills?limit=${limit}`);
}

export async function fetchAnalyticsSummary() {
    return fetchAPI<import('../types').AnalyticsSummary>('/api/v1/analytics/summary');
}
