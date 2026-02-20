import { useState, useEffect } from 'preact/hooks';
import { fetchProfile, fetchSavedJobs, unsaveJob } from '../../lib/api';
import { getToken, clearToken, isLoggedIn } from '../../lib/auth';
import type { UserProfile, JobSummary } from '../../types';

export default function ProfileView() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [savedJobs, setSavedJobs] = useState<JobSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn()) {
            setLoading(false);
            return;
        }

        const token = getToken()!;
        Promise.all([fetchProfile(token), fetchSavedJobs(token)])
            .then(([profileData, jobsData]) => {
                setProfile(profileData);
                setSavedJobs(jobsData || []);
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : 'Failed to load profile');
                if (err instanceof Error && err.message.includes('401')) {
                    clearToken();
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleUnsave = async (jobId: string) => {
        const token = getToken();
        if (!token) return;
        try {
            await unsaveJob(token, jobId);
            setSavedJobs(prev => prev.filter(j => j.id !== jobId));
        } catch {
            // Silently handle
        }
    };

    const handleLogout = () => {
        clearToken();
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div class="flex justify-center py-12">
                <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isLoggedIn()) {
        return (
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">Please sign in</h3>
                <p class="text-slate-500 dark:text-slate-400 mb-4">You need to be logged in to view your profile.</p>
                <a href="/auth/login" class="inline-flex px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
                    Sign In
                </a>
            </div>
        );
    }

    if (error) {
        return (
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <p class="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div class="space-y-6">
            {/* Profile Card */}
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <span class="text-xl font-bold text-primary-600 dark:text-primary-400">
                                {profile?.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">{profile?.name}</h2>
                            <p class="text-slate-500 dark:text-slate-400">{profile?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        class="px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        Logout
                    </button>
                </div>
                {profile?.createdAt && (
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                        Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                )}
            </div>

            {/* Saved Jobs */}
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Saved Jobs ({savedJobs.length})
                </h3>
                {savedJobs.length === 0 ? (
                    <div class="text-center py-8">
                        <svg class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <p class="text-slate-500 dark:text-slate-400">No saved jobs yet</p>
                        <a href="/jobs" class="text-primary-600 dark:text-primary-400 hover:underline text-sm mt-1 inline-block">
                            Browse jobs →
                        </a>
                    </div>
                ) : (
                    <div class="space-y-3">
                        {savedJobs.map(job => (
                            <div key={job.id} class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div class="flex-1 min-w-0">
                                    <a href={`/jobs/${job.id}`} class="font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 truncate block">
                                        {job.title}
                                    </a>
                                    <p class="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {job.company} • {job.location}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleUnsave(job.id)}
                                    class="ml-3 p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Remove from saved"
                                >
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
