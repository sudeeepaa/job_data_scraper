import type { JobSummary, SalaryRange } from "../types";

export function getSalaryRange(job: Pick<JobSummary, "salaryMin" | "salaryMax" | "salaryCurrency">): SalaryRange | null {
    if (job.salaryMin == null && job.salaryMax == null) {
        return null;
    }

    return {
        min: job.salaryMin ?? 0,
        max: job.salaryMax ?? job.salaryMin ?? 0,
        currency: job.salaryCurrency || "USD",
    };
}

export function formatSalaryRange(job: Pick<JobSummary, "salaryMin" | "salaryMax" | "salaryCurrency">): string | null {
    const salary = getSalaryRange(job);
    if (!salary) {
        return null;
    }

    const money = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: salary.currency,
        maximumFractionDigits: 0,
    });

    return `${money.format(salary.min)} - ${money.format(salary.max)}`;
}

export function formatCompactSalary(job: Pick<JobSummary, "salaryMin" | "salaryMax" | "salaryCurrency">): string | null {
    const salary = getSalaryRange(job);
    if (!salary) {
        return null;
    }

    const compact = new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    });

    return `${compact.format(salary.min)} - ${compact.format(salary.max)} ${salary.currency}`;
}

export function formatPostedDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff <= 0) {
        return "Today";
    }
    if (diff === 1) {
        return "Yesterday";
    }
    if (diff < 7) {
        return `${diff} days ago`;
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: now.getFullYear() === date.getFullYear() ? undefined : "numeric",
    });
}

export function formatAbsoluteDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function getInitials(name: string): string {
    const parts = name.split(" ").filter(Boolean).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "J";
}

export function sourceLabel(source: string): string {
    if (!source) {
        return "Live source";
    }
    return source
        .split(/[-_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function getCompanyColor(name: string): string {
    const colors = [
        "#3B82F6", // blue
        "#10B981", // emerald
        "#F59E0B", // amber
        "#EF4444", // red
        "#8B5CF6", // violet
        "#EC4899", // pink
        "#06B6D4", // cyan
        "#F97316", // orange
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}
