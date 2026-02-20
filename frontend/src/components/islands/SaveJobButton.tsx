import { useState, useEffect } from 'preact/hooks';
import { saveJob, unsaveJob } from '../../lib/api';
import { getToken, isLoggedIn } from '../../lib/auth';

interface Props {
    jobId: string;
}

export default function SaveJobButton({ jobId }: Props) {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (!isLoggedIn()) {
            window.location.href = '/auth/login';
            return;
        }

        const token = getToken()!;
        setLoading(true);

        try {
            if (saved) {
                await unsaveJob(token, jobId);
                setSaved(false);
            } else {
                await saveJob(token, jobId);
                setSaved(true);
            }
        } catch {
            // Silently handle
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            class={`p-2 rounded-lg transition-colors ${saved
                    ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            title={saved ? 'Remove from saved' : 'Save job'}
        >
            {loading ? (
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : (
                <svg class="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )}
        </button>
    );
}
