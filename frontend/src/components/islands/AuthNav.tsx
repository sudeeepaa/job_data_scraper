import { useState, useEffect } from 'preact/hooks';
import { fetchSession, logout } from '../../lib/api';

export default function AuthNav() {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        fetchSession()
            .then((session) => {
                setLoggedIn(!!session.authenticated);
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

    if (loggedIn) {
        return (
            <div class="flex items-center gap-3">
                <a
                    href="/auth/profile"
                    class="inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-base font-semibold tracking-[-0.03em] text-slate-700 hover:bg-[var(--jh-soft)] hover:text-[var(--jh-primary)]"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                </a>
                <button
                    type="button"
                    onClick={handleLogout}
                    class="inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-base font-semibold tracking-[-0.03em] text-slate-500 hover:bg-[var(--jh-soft)] hover:text-[var(--jh-coral)]"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div class="flex items-center gap-3">
            <a
                href="/auth/login"
                class="inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-base font-semibold tracking-[-0.03em] text-slate-700 hover:bg-[var(--jh-soft)] hover:text-[var(--jh-primary)]"
            >
                Login
            </a>
            <a href="/auth/register" class="jh-button">Sign Up</a>
        </div>
    );
}
