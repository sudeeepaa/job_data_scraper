import { selectedJobs, toggleComparison } from "../../lib/compare-store";
import type { JobSummary } from "../../types";

export default function CompareCheckbox({ job }: { job: JobSummary }) {
    const isSelected = selectedJobs.value.some(j => j.id === job.id);

    return (
        <label class="flex items-center gap-2 cursor-pointer group/check">
            <div class="relative flex items-center justify-center">
                <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleComparison(job)}
                    class="peer appearance-none h-5 w-5 rounded-lg border-2 border-[var(--jp-border)] bg-[var(--jp-surface)] checked:border-[var(--jp-accent)] checked:bg-[var(--jp-accent)]/10 transition-all cursor-pointer"
                />
                <svg 
                    class="absolute w-3.5 h-3.5 text-[var(--jp-accent)] scale-0 peer-checked:scale-100 transition-transform pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--jp-text-muted)] group-hover/check:text-[var(--jp-text-primary)] transition-colors">
                Compare
            </span>
        </label>
    );
}
