import { useEffect, useState } from "preact/hooks";
import { fetchProfile, fetchSavedJobs, unsaveJob } from "../../lib/api";
import { clearToken, getToken, isLoggedIn } from "../../lib/auth";
import { formatPostedDate, getInitials } from "../../lib/job-ui";
import type { JobSummary, UserProfile } from "../../types";

export default function ProfileView() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [savedJobs, setSavedJobs] = useState<JobSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isLoggedIn()) {
            setLoading(false);
            return;
        }

        const token = getToken()!;
        Promise.all([fetchProfile(token), fetchSavedJobs(token)])
            .then(([profileData, jobsData]) => {
                setProfile(profileData);
                setSavedJobs(jobsData.data || []);
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : "Failed to load profile");
                if (err instanceof Error && err.message.includes("401")) {
                    clearToken();
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleUnsave = async (jobId: string) => {
        const token = getToken();
        if (!token) {
            return;
        }

        try {
            await unsaveJob(token, jobId);
            setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
        } catch {
            // Keep the current UI state if the request fails.
        }
    };

    const handleLogout = () => {
        clearToken();
        window.location.href = "/";
    };

    if (loading) {
        return (
            <div class="flex justify-center py-20">
                <div class="h-10 w-10 animate-spin rounded-full border-4 border-[rgba(99,91,255,0.15)] border-t-[var(--jh-primary)]"></div>
            </div>
        );
    }

    if (!isLoggedIn()) {
        return (
            <div class="jh-card p-10 text-center">
                <svg class="mx-auto mb-5 h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 class="mb-3 text-3xl font-extrabold tracking-[-0.05em] text-slate-900">Please sign in</h3>
                <p class="mb-6 text-lg text-slate-500">You need to be logged in to view your profile.</p>
                <a href="/auth/login" class="jh-button">Sign In</a>
            </div>
        );
    }

    if (error) {
        return (
            <div class="rounded-[1.5rem] border border-[rgba(255,108,95,0.28)] bg-[rgba(255,108,95,0.08)] p-6 text-center text-lg font-medium text-[var(--jh-coral)]">
                {error}
            </div>
        );
    }

    return (
        <div class="space-y-8">
            <section class="jh-card overflow-hidden">
                <div class="h-48 bg-[linear-gradient(115deg,#f3c6d7_0%,#d192c0_38%,#76498e_100%)]"></div>
                <div class="-mt-16 grid gap-8 px-8 pb-8 lg:grid-cols-[1fr_19rem]">
                    <div class="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(37,47,94,0.06)]">
                        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div class="flex items-center gap-5">
                                <div class="flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-white bg-[linear-gradient(135deg,#3fa7ff_0%,#2469ff_100%)] text-4xl font-extrabold text-white shadow-[0_20px_45px_rgba(36,105,255,0.24)]">
                                    {getInitials(profile?.name || "Profile")}
                                </div>
                                <div>
                                    <h2 class="text-5xl font-extrabold tracking-[-0.06em] text-slate-900">{profile?.name}</h2>
                                    <p class="mt-3 text-2xl text-slate-500">{profile?.email}</p>
                                    <div class="mt-4 inline-flex items-center gap-3 rounded-[1.1rem] bg-[rgba(88,214,190,0.16)] px-4 py-3 text-base font-semibold text-[var(--jh-mint)]">
                                        <span class="inline-block h-3 w-3 rounded-full bg-[var(--jh-mint)]"></span>
                                        Open for opportunities
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleLogout} class="jh-button-secondary justify-center px-6 py-4 text-[var(--jh-coral)]">
                                Logout
                            </button>
                        </div>
                    </div>

                    <div class="jh-card p-7">
                        <h3 class="text-[1.9rem] font-extrabold tracking-[-0.05em] text-slate-900">Additional Details</h3>
                        <div class="mt-6 space-y-5 text-lg text-slate-600">
                            <div>
                                <div class="font-semibold text-slate-900">Email</div>
                                <div class="mt-1">{profile?.email}</div>
                            </div>
                            <div>
                                <div class="font-semibold text-slate-900">Member since</div>
                                <div class="mt-1">
                                    {profile?.createdAt
                                        ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                                        : "Recently"}
                                </div>
                            </div>
                            <div>
                                <div class="font-semibold text-slate-900">Saved jobs</div>
                                <div class="mt-1">{savedJobs.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="jh-card p-8">
                <div class="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h3 class="text-[2rem] font-extrabold tracking-[-0.05em] text-slate-900">Saved Jobs</h3>
                        <p class="mt-2 text-lg text-slate-500">Keep track of the roles you want to revisit.</p>
                    </div>
                    <a href="/jobs" class="jh-button-secondary px-5 py-4">Find Jobs</a>
                </div>

                {savedJobs.length === 0 ? (
                    <div class="rounded-[1.6rem] border border-dashed border-[var(--jh-border)] px-6 py-14 text-center">
                        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--jh-soft)] text-[var(--jh-primary)]">
                            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <p class="text-lg text-slate-500">No saved jobs yet.</p>
                    </div>
                ) : (
                    <div class="space-y-4">
                        {savedJobs.map((job) => (
                            <article key={job.id} class="grid gap-5 rounded-[1.6rem] border border-[var(--jh-border)] bg-white px-6 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
                                <div class="flex items-start gap-4">
                                    <div class="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,#dff8f0_0%,#74cfbf_100%)] text-xl font-extrabold text-slate-900">
                                        {getInitials(job.company)}
                                    </div>
                                    <div>
                                        <a href={`/jobs/${job.id}`} class="text-[1.45rem] font-bold tracking-[-0.04em] text-slate-900 hover:text-[var(--jh-primary)]">
                                            {job.title}
                                        </a>
                                        <p class="mt-1 text-lg text-slate-500">{job.company} • {job.location}</p>
                                        <p class="mt-3 text-base text-slate-500">Saved role, posted {formatPostedDate(job.postedAt)}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <a href={`/jobs/${job.id}`} class="jh-button-secondary px-5 py-4">Open Job</a>
                                    <button
                                        onClick={() => handleUnsave(job.id)}
                                        class="rounded-[1.1rem] border border-[rgba(255,108,95,0.26)] px-4 py-4 text-[var(--jh-coral)] hover:bg-[rgba(255,108,95,0.08)]"
                                        title="Remove from saved"
                                    >
                                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
