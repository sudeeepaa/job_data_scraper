import { useState, useEffect } from 'preact/hooks';
import { fetchSession, logout, fetchProfile, fetchSavedJobs } from '../../lib/api';

export default function AuthNav() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [savedJobsCount, setSavedJobsCount] = useState(0);

    useEffect(() => {
        fetchSession()
            .then((session) => {
                setLoggedIn(!!session.authenticated);
                if (session.authenticated && session.user) {
                    setUser(session.user);
                    // Fetch saved jobs count
                    fetchSavedJobs()
                        .then((response) => {
                            setSavedJobsCount(response.data.length);
                        })
                        .catch(() => {
                            setSavedJobsCount(0);
                        });
                }
            })
            .catch(() => {
                setLoggedIn(false);
            });
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            window.location.href = "/";
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loggedIn && user) {
        return (
            <div class="flex items-center gap-4">
                <a
                    href="/jobs"
                    class="relative inline-flex items-center gap-2 rounded-[1rem] px-3 py-2 text-sm font-semibold tracking-[-0.03em] text-[var(--jp-text-primary)] hover:bg-[var(--jp-surface)] transition-colors"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Saved
                    {savedJobsCount > 0 && (
                        <span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--jp-accent)] text-xs font-bold text-[var(--jp-bg)] animate-pulse">
                            {savedJobsCount}
                        </span>
                    )}
                </a>
                <a
                    href="/auth/profile"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--jp-accent)] text-sm font-bold text-[var(--jp-bg)] hover:bg-[var(--jp-accent-dark)] transition-colors"
                    title={user.name}
                >
                    {getInitials(user.name)}
                </a>
            </div>
        );
    }

    return (
        <div class="flex items-center gap-3">
            <a
                href="/auth/login"
                class="inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-base font-semibold tracking-[-0.03em] text-[var(--jp-text-primary)] hover:bg-[var(--jp-surface)] hover:text-[var(--jp-accent)] transition-colors"
            >
                Login
            </a>
            <a href="/auth/register" class="btn-primary">Sign Up</a>
        </div>
    );
}
