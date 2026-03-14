import { useState } from "preact/hooks";
import { saveJob, unsaveJob } from "../../lib/api";
import { getToken, isLoggedIn } from "../../lib/auth";

interface Props {
    jobId: string;
    initialSaved?: boolean;
}

export default function SaveJobButton({ jobId, initialSaved = false }: Props) {
    const [saved, setSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (!isLoggedIn()) {
            window.location.href = "/auth/login";
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            class={`rounded-[1.1rem] border px-4 py-4 transition-colors ${
                saved
                    ? "border-[rgba(255,108,95,0.24)] bg-[rgba(255,108,95,0.08)] text-[var(--jh-coral)]"
                    : "border-[var(--jh-border)] bg-white text-slate-500 hover:border-[var(--jh-primary)] hover:text-[var(--jh-primary)]"
            }`}
            title={saved ? "Remove from saved" : "Save job"}
        >
            {loading ? (
                <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.95 7.95 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z" />
                </svg>
            ) : (
                <svg class="h-5 w-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.32 6.32a4.5 4.5 0 000 6.36L12 20.36l7.68-7.68a4.5 4.5 0 00-6.36-6.36L12 7.64l-1.32-1.32a4.5 4.5 0 00-6.36 0z" />
                </svg>
            )}
        </button>
    );
}
