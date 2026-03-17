import { useState, useEffect } from 'preact/hooks';
import { fetchApplications, updateApplication, deleteApplication, createApplication } from '../../lib/api';
import type { Application, ApplicationStatus } from '../../types';

const COLUMNS: { id: ApplicationStatus; label: string; icon: string }[] = [
    { id: 'wishlist', label: 'Wishlist', icon: '📝' },
    { id: 'applied', label: 'Applied', icon: '📩' },
    { id: 'interviewing', label: 'Interviewing', icon: '🤝' },
    { id: 'offered', label: 'Offered', icon: '🎉' },
    { id: 'rejected', label: 'Rejected', icon: '❌' }
];

export default function ApplicationTracker() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newApp, setNewApp] = useState({ title: '', company: '', status: 'wishlist' as ApplicationStatus });

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setIsLoading(true);
        try {
            const { data } = await fetchApplications();
            setApplications(data);
        } catch (err) {
            console.error('Failed to load applications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
        try {
            const updated = await updateApplication(id, { status: newStatus });
            setApplications(apps => apps.map(a => a.id === id ? { ...a, status: newStatus } : a));
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this application?')) return;
        try {
            await deleteApplication(id);
            setApplications(apps => apps.filter(a => a.id !== id));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            const created = await createApplication(newApp);
            setApplications([...applications, created]);
            setIsAdding(false);
            setNewApp({ title: '', company: '', status: 'wishlist' });
        } catch (err) {
            console.error('Failed to create:', err);
        }
    };

    if (isLoading) {
        return (
            <div class="flex flex-col items-center justify-center py-20 gap-4">
                <div class="w-12 h-12 border-4 border-[var(--jp-accent)] border-t-transparent rounded-full animate-spin"></div>
                <p class="text-[var(--jp-text-muted)] font-bold uppercase tracking-widest text-xs">Syncing your career...</p>
            </div>
        );
    }

    return (
        <div class="space-y-10 animate-in">
            <div class="flex items-center justify-between gap-6">
                <div>
                    <h2 class="text-3xl font-bold tracking-tighter">Your <span class="text-[var(--jp-accent)]">Pipeline</span></h2>
                    <p class="text-sm text-[var(--jp-text-muted)] font-medium mt-1">Track your progress across multiple opportunities.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    class="btn-primary px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[var(--jp-accent)]/10"
                >
                    {isAdding ? "Cancel" : "Add Opportunity +"}
                </button>
            </div>

            {isAdding && (
                <div class="glass-card p-8 animate-in border-[var(--jp-accent)]/30">
                    <form onSubmit={handleAdd} class="grid md:grid-cols-4 gap-6 items-end">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--jp-text-muted)]">Position Title</label>
                            <input 
                                value={newApp.title}
                                onInput={(e: any) => setNewApp({ ...newApp, title: e.target.value })}
                                class="w-full bg-[var(--jp-surface)] border border-[var(--jp-border)] rounded-xl px-4 py-2.5 text-sm focus:border-[var(--jp-accent)] outline-none"
                                placeholder="e.g. Senior Go Engineer"
                                required
                            />
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--jp-text-muted)]">Company</label>
                            <input 
                                value={newApp.company}
                                onInput={(e: any) => setNewApp({ ...newApp, company: e.target.value })}
                                class="w-full bg-[var(--jp-surface)] border border-[var(--jp-border)] rounded-xl px-4 py-2.5 text-sm focus:border-[var(--jp-accent)] outline-none"
                                placeholder="e.g. Acme Corp"
                                required
                            />
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--jp-text-muted)]">Initial Status</label>
                            <select 
                                value={newApp.status}
                                onChange={(e: any) => setNewApp({ ...newApp, status: e.target.value })}
                                class="w-full bg-[var(--jp-surface)] border border-[var(--jp-border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--jp-accent)] outline-none"
                            >
                                {COLUMNS.map(col => <option value={col.id}>{col.label}</option>)}
                            </select>
                        </div>
                        <button type="submit" class="btn-primary py-3 rounded-xl font-bold">Add to Board</button>
                    </form>
                </div>
            )}

            <div class="grid lg:grid-cols-5 gap-6 items-start overflow-x-auto pb-6">
                {COLUMNS.map(col => {
                    const colApps = applications.filter(a => a.status === col.id);
                    return (
                        <div class="min-w-[280px] space-y-4">
                            <div class="flex items-center justify-between px-2 mb-4">
                                <div class="flex items-center gap-2">
                                    <span class="text-xl">{col.icon}</span>
                                    <h3 class="font-bold tracking-tight text-lg">{col.label}</h3>
                                </div>
                                <span class="bg-[var(--jp-surface)] text-[var(--jp-text-muted)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--jp-border)]">
                                    {colApps.length}
                                </span>
                            </div>

                            <div class="space-y-4 min-h-[400px] rounded-2xl bg-black/20 p-2 border border-[var(--jp-border)]/50">
                                {colApps.map(app => (
                                    <div class="glass-card p-4 group hover:border-[var(--jp-accent)]/50 transition-colors animate-in">
                                        <div class="flex items-start justify-between mb-2">
                                            <h4 class="font-bold text-sm leading-tight text-[var(--jp-text-primary)]">
                                                {app.title}
                                            </h4>
                                            <button 
                                                onClick={() => handleDelete(app.id)}
                                                class="opacity-0 group-hover:opacity-100 text-[10px] text-rose-400 hover:text-rose-500 transition-opacity"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <p class="text-xs text-[var(--jp-text-muted)] font-medium mb-4">
                                            🏢 {app.company}
                                        </p>
                                        
                                        <div class="flex items-center gap-1.5 mt-auto pt-4 border-t border-[var(--jp-border)]/30">
                                            <div class="flex-1 text-[10px] text-[var(--jp-text-muted)] font-bold uppercase tracking-tight">Move to:</div>
                                            <div class="flex gap-1">
                                                {COLUMNS.filter(c => c.id !== app.status).map(c => (
                                                    <button 
                                                        onClick={() => handleStatusChange(app.id, c.id)}
                                                        title={`Move to ${c.label}`}
                                                        class="h-6 w-6 flex items-center justify-center rounded-lg bg-[var(--jp-surface)] hover:bg-[var(--jp-accent)] hover:text-white transition-colors text-xs border border-[var(--jp-border)]"
                                                    >
                                                        {c.icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {colApps.length === 0 && (
                                    <div class="h-32 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-[var(--jp-border)] rounded-2xl">
                                        <p class="text-xs font-medium">No items</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
