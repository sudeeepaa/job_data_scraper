export interface SalaryRange {
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
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    postedAt: string;
    source: string;
    sourceUrl: string;
    skills: string[];
    isRemote: boolean;
    experienceLevel: string;
    isSaved?: boolean;
}

export interface Job extends JobSummary {
    description: string;
    expiresAt?: string;
    employmentType: string;
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

export interface MarketTrend {
    skillName: string;
    mentionCount: number;
    avgSalaryMin: number;
    avgSalaryMax: number;
    snapshotDate: string;
}

export interface SourceDistribution {
    source: string;
    count: number;
}

export interface SalaryStats {
    minSalary: number;
    maxSalary: number;
    avgMin: number;
    avgMax: number;
    medianSalary: number;
    totalWithSalary: number;
}

export interface AuthResponse {
    token: string;
    user: UserProfile;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface SavedJobsResponse {
    data: JobSummary[];
}

export interface APIError {
    error: string;
    code: number;
}
