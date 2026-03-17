import { useEffect, useState } from "preact/hooks";
import { fetchApplications, fetchProfile, fetchSavedJobs, fetchSession, logout, unsaveJob } from "../../lib/api";
import { formatPostedDate, getInitials } from "../../lib/job-ui";
import type { JobSummary, UserProfile } from "../../types";

export default function ProfileView() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [savedJobs, setSavedJobs] = useState<JobSummary[]>([]);
    const [appsCount, setAppsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSession()
            .then((session) => {
                if (!session.authenticated) {
                    return null;
                }

                return Promise.all([fetchProfile(), fetchSavedJobs(), fetchApplications()]);
            })
            .then((result) => {
                if (!result) {
                    return;
                }

                const [profileData, jobsData, appsData] = result;
                setProfile(profileData);
                setSavedJobs(jobsData.data || []);
                setAppsCount((appsData as any).data?.length || 0);
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : "Failed to load profile");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleUnsave = async (jobId: string) => {
        try {
            await unsaveJob(jobId);
            setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
        } catch {
            // Keep the current UI state if the request fails.
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            window.location.href = "/";
        }
    };

    if (loading) {
        return (
            <div class="flex justify-center py-20">
                <div class="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[var(--jp-accent)]"></div>
            </div>
        );
    }

    if (!profile && !error) {
        return (
            <div class="glass-card p-12 text-center rounded-[2rem]">
                <svg class="mx-auto mb-6 h-20 w-20 text-[var(--jp-text-muted)] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 class="mb-4 text-4xl font-bold tracking-tighter text-[var(--jp-text-primary)]">Please sign in</h3>
                <p class="mb-10 text-xl text-[var(--jp-text-muted)] font-medium">You need to be logged in to view your profile.</p>
                <a href="/auth/login" class="btn-primary px-10">Sign In</a>
            </div>
        );
    }

    if (error) {
        return (
            <div class="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-xl font-bold text-rose-400">
                {error}
            </div>
        );
    }

    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Recently";

    return (
        <div class="space-y-12">
            {/* Header Section */}
            <section class="relative overflow-hidden rounded-[2.5rem] border border-[var(--jp-border)] bg-gradient-to-br from-[#1A1D27] to-[#0F1117] p-8 md:p-12">
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div class="flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[var(--jp-accent)] text-4xl font-bold text-black shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                            {getInitials(profile?.name || "P")}
                        </div>
                        <div>
                            <h2 class="text-4xl md:text-6xl font-bold tracking-tighter text-[var(--jp-text-primary)]">{profile?.name}</h2>
                            <p class="mt-2 text-xl md:text-2xl text-[var(--jp-text-muted)] font-medium">{profile?.email}</p>
                            <p class="mt-4 text-xs font-bold uppercase tracking-widest text-[var(--jp-text-muted)] opacity-60">Member since {memberSince}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        class="btn-secondary group flex items-center gap-2 border-[var(--jp-border)] hover:border-rose-500/50 hover:text-rose-400 transition-all active:scale-[0.98]"
                    >
                        <span>Logout</span>
                        <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* Stats Row */}
            <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div class="glass-card p-8 rounded-3xl group">
                    <p class="text-xs font-bold uppercase tracking-widest text-[var(--jp-text-muted)] mb-2 group-hover:text-[var(--jp-accent)] transition-colors">Saved Jobs</p>
                    <p class="text-5xl font-bold tracking-tighter text-[var(--jp-accent)]">{savedJobs.length}</p>
                </div>
                <div class="glass-card p-8 rounded-3xl group">
                    <p class="text-xs font-bold uppercase tracking-widest text-[var(--jp-text-muted)] mb-2 group-hover:text-[var(--jp-accent)] transition-colors">Applications</p>
                    <p class="text-5xl font-bold tracking-tighter text-[var(--jp-accent)]">{appsCount}</p>
                </div>
                <div class="glass-card p-8 rounded-3xl group">
                    <p class="text-xs font-bold uppercase tracking-widest text-[var(--jp-text-muted)] mb-2 group-hover:text-[var(--jp-accent)] transition-colors">Account Tenure</p>
                    <p class="text-3xl font-bold tracking-tighter text-[var(--jp-text-primary)]">{memberSince}</p>
                </div>
            </section>

            {/* Saved Jobs List */}
            <section class="space-y-8">
                <div class="flex items-end justify-between border-b border-[var(--jp-border)] pb-8">
                    <div>
                        <h3 class="text-3xl md:text-5xl font-bold tracking-tighter">Saved <span class="text-[var(--jp-accent)]">Jobs</span></h3>
                        <p class="mt-2 text-lg text-[var(--jp-text-muted)] font-medium">Roles you've bookmarked for later consideration.</p>
                    </div>
                    <a href="/jobs" class="hidden sm:block text-sm font-bold uppercase tracking-widest text-[var(--jp-accent)] hover:underline">Find more jobs</a>
                </div>

                {savedJobs.length === 0 ? (
                    <div class="glass-card p-20 text-center rounded-[2.5rem] border-dashed border-2">
                        <div class="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--jp-accent)]/10 text-[var(--jp-accent)] shadow-[0_0_50px_rgba(245,158,11,0.05)]">
                            <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h4 class="text-2xl font-bold mb-2">No saved jobs yet</h4>
                        <p class="text-lg text-[var(--jp-text-muted)] font-medium mb-10">Start exploring the catalog to build your wishlist.</p>
                        <a href="/jobs" class="btn-primary">Browse All Jobs</a>
                    </div>
                ) : (
                    <div class="grid gap-6">
                        {savedJobs.map((job, i) => (
                            <div key={job.id} class="glass-card p-6 md:p-8 rounded-[2rem] animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div class="flex items-center gap-6">
                                        <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#1E2130] border border-[var(--jp-border)] text-2xl font-bold text-[var(--jp-accent)] shadow-xl">
                                            {getInitials(job.company)}
                                        </div>
                                        <div>
                                            <a href={`/jobs/${job.id}`} class="text-2xl font-bold tracking-tight text-[var(--jp-text-primary)] hover:text-[var(--jp-accent)] transition-colors">
                                                {job.title}
                                            </a>
                                            <p class="text-lg text-[var(--jp-text-muted)] font-medium mt-1">{job.company} • {job.location}</p>
                                            <div class="mt-4 flex flex-wrap gap-2">
                                                <span class="text-[10px] font-bold uppercase tracking-widest py-1 px-3 border border-[var(--jp-border)] rounded-full text-[var(--jp-text-muted)]">
                                                    Saved {formatPostedDate(job.postedAt)}
                                                </span>
                                                {job.isRemote && (
                                                    <span class="text-[10px] font-bold uppercase tracking-widest py-1 px-3 bg-emerald-500/10 text-emerald-400 rounded-full">Remote</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <a href={`/jobs/${job.id}`} class="btn-secondary px-6 py-3 text-sm">Open Job</a>
                                        <button
                                            onClick={() => handleUnsave(job.id)}
                                            class="p-4 rounded-full border border-rose-500/20 text-rose-500/50 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/50 transition-all active:scale-[0.98]"
                                            title="Unsave Job"
                                        >
                                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
