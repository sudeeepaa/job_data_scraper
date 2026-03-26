import { useState } from 'preact/hooks';
import { selectedJobs, clearComparison } from '../../lib/compare-store';
import { formatCompactSalary, sourceLabel } from '../../lib/job-ui';

export default function JobComparisonModal() {
    const jobs = selectedJobs.value;
    const [isOpen, setIsOpen] = useState(false);

    if (jobs.length === 0) return null;

    return (
        <>
            {/* Floating FAB */}
            <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
                <button 
                    onClick={() => setIsOpen(true)}
                    class="flex items-center gap-4 bg-[var(--jp-surface)] border border-[var(--jp-accent)]/50 px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                >
                    <div class="flex -space-x-3">
                        {jobs.map(job => (
                            <div class="h-8 w-8 rounded-full bg-[var(--jp-accent)] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[var(--jp-surface)] shadow-sm">
                                {job.company.charAt(0)}
                            </div>
                        ))}
                    </div>
                    <div class="text-left">
                        <p class="text-[10px] font-bold uppercase tracking-widest text-[var(--jp-accent)] leading-none italic">Select for compare</p>
                        <p class="text-sm font-bold mt-1 text-[var(--jp-text-primary)]">Compare {jobs.length} Opportunities</p>
                    </div>
                </button>
            </div>

            {/* Modal */}
            {isOpen && (
                <div class="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-in fade-in bg-black/80 backdrop-blur-sm">
                    <div class="w-full max-w-6xl glass-card max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border-[var(--jp-accent)]/20 shadow-[0_0_100px_rgba(245,158,11,0.1)]">
                        <div class="p-8 border-b border-[var(--jp-border)] flex items-center justify-between bg-gradient-to-r from-[var(--jp-accent)]/5 to-transparent">
                            <div>
                                <h2 class="text-3xl font-bold tracking-tighter">Side-by-Side <span class="text-[var(--jp-accent)]">Comparison</span></h2>
                                <p class="text-sm text-[var(--jp-text-muted)] font-medium mt-1">Analyzing market-fit and alignment across selected roles.</p>
                            </div>
                            <div class="flex items-center gap-4">
                                <button 
                                    onClick={clearComparison}
                                    class="text-xs font-bold uppercase tracking-widest text-[var(--jp-text-muted)] hover:text-rose-400 transition-colors"
                                >
                                    Clear All
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    class="h-10 w-10 flex items-center justify-center rounded-full bg-[var(--jp-surface)] border border-[var(--jp-border)] hover:bg-[var(--jp-border)] transition-colors text-xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div class="flex-1 overflow-x-auto p-8 pt-0">
                            <table class="w-full text-left border-collapse min-w-[800px]">
                                <thead class="sticky top-0 bg-[var(--jp-surface)] z-10">
                                    <tr>
                                        <th class="py-6 pr-6 border-b border-[var(--jp-border)] w-48"></th>
                                        {jobs.map(job => (
                                            <th class="py-6 px-6 border-b border-[var(--jp-border)] min-w-[200px]">
                                                <div class="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--jp-accent)]">{sourceLabel(job.source)}</div>
                                                <h3 class="text-lg font-bold leading-tight mb-2 line-clamp-2 h-12">{job.title}</h3>
                                                <p class="text-sm text-[var(--jp-text-muted)] font-medium">🏢 {job.company}</p>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody class="text-sm">
                                    <tr>
                                        <td class="py-6 pr-6 border-b border-[var(--jp-border)] font-bold uppercase text-[10px] text-[var(--jp-text-muted)] tracking-widest">Compensation</td>
                                        {jobs.map(job => (
                                            <td class="py-6 px-6 border-b border-[var(--jp-border)] font-bold text-[var(--jp-accent)] text-lg">
                                                {formatCompactSalary(job) || "Competitive"}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td class="py-6 pr-6 border-b border-[var(--jp-border)] font-bold uppercase text-[10px] text-[var(--jp-text-muted)] tracking-widest">Location</td>
                                        {jobs.map(job => (
                                            <td class="py-6 px-6 border-b border-[var(--jp-border)] font-medium">
                                                {job.location} {job.isRemote && <span class="ml-2 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Remote</span>}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td class="py-6 pr-6 border-b border-[var(--jp-border)] font-bold uppercase text-[10px] text-[var(--jp-text-muted)] tracking-widest">Senority</td>
                                        {jobs.map(job => (
                                            <td class="py-6 px-6 border-b border-[var(--jp-border)] font-medium capitalize">
                                                {job.experienceLevel}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td class="py-6 pr-6 border-b border-[var(--jp-border)] font-bold uppercase text-[10px] text-[var(--jp-text-muted)] tracking-widest">Core Stack</td>
                                        {jobs.map(job => (
                                            <td class="py-6 px-6 border-b border-[var(--jp-border)]">
                                                <div class="flex flex-wrap gap-1.5">
                                                    {job.skills.map(skill => (
                                                        <span class="text-[9px] bg-[var(--jp-border)]/50 px-2 py-0.5 rounded-md font-bold text-[var(--jp-text-muted)] group-hover:text-[var(--jp-text-primary)] transition-colors">{skill}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td class="py-6 pr-6 border-b border-[var(--jp-border)] font-bold uppercase text-[10px] text-[var(--jp-text-muted)] tracking-widest">Posted</td>
                                        {jobs.map(job => (
                                            <td class="py-6 px-6 border-b border-[var(--jp-border)] font-medium text-[var(--jp-text-muted)]">
                                                {new Date(job.postedAt).toLocaleDateString()}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td class="py-8 pr-6 border-none"></td>
                                        {jobs.map(job => (
                                            <td class="py-8 px-6 border-none">
                                                <a href={`/jobs/${job.id}`} class="btn-primary w-full justify-center py-2.5 rounded-xl font-bold">
                                                    Apply Details
                                                </a>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
