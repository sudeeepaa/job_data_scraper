// Job types matching Go backend models

export interface Salary {
    min: number;
    max: number;
    currency: string;
}

export interface JobSummary {
    id: string;
    title: string;
    company: string;
    companySlug: string;
    location: string;
    salary?: Salary;
    postedAt: string;
    source: 'linkedin' | 'indeed';
    skills: string[];
    isRemote: boolean;
    experienceLevel: string;
}

export interface Job extends JobSummary {
    description: string;
    expiresAt?: string;
    employmentType: string;
    url: string;
}

export interface Company {
    slug: string;
    name: string;
    industry: string;
    description: string;
    website: string;
    logoUrl?: string;
    jobCount: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
}

export interface JobListResponse {
    data: JobSummary[];
    pagination: PaginationMeta;
}

export interface CompanyListResponse {
    data: Company[];
}

export interface CompanyDetailResponse {
    company: Company;
    jobs: JobSummary[];
}

export interface FilterOptions {
    locations: string[];
    experienceLevels: string[];
    sources: string[];
    skills: string[];
}

export interface SkillCount {
    name: string;
    count: number;
}

export interface AnalyticsSummary {
    totalJobs: number;
    totalCompanies: number;
    jobsToday: number;
    jobsThisWeek: number;
    averageSalary: number;
    remoteJobsCount: number;
}
