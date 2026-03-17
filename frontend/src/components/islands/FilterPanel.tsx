import { useState, useEffect } from 'preact/hooks';
import type { FilterOptions } from '../../types';

interface Props {
    filters: FilterOptions;
    applied: Record<string, string>;
}

export default function FilterPanel({ filters, applied }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState(applied);

    const updateFilter = (key: string, value: string) => {
        const newFilters = { ...localFilters };
        if (value) {
            newFilters[key] = value;
        } else {
            delete newFilters[key];
        }
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        window.location.href = `/jobs?${params.toString()}`;
    };

    const clearFilters = () => {
        setLocalFilters({});
        window.location.href = '/jobs';
    };

    const activeFilterCount = Object.keys(localFilters).filter(k => k !== 'q' && k !== 'page').length;

    return (
        <div class="w-full">
            {/* Mobile toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                class="lg:hidden w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mb-4"
            >
                <span class="font-medium text-slate-900 dark:text-white">
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </span>
                <svg class={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Filter panel */}
            <div class={`lg:block ${isOpen ? 'block' : 'hidden'}`}>
                <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-5">
                    <h3 class="font-semibold text-slate-900 dark:text-white">Filters</h3>

                    {/* Location */}
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Location
                        </label>
                        <select
                            value={localFilters.location || ''}
                            onChange={(e) => updateFilter('location', (e.target as HTMLSelectElement).value)}
                            class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        >
                            <option value="">All locations</option>
                            {filters.locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>


                    {/* Source */}
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Source
                        </label>
                        <select
                            value={localFilters.source || ''}
                            onChange={(e) => updateFilter('source', (e.target as HTMLSelectElement).value)}
                            class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        >
                            <option value="">All sources</option>
                            {filters.sources.map(source => (
                                <option key={source} value={source}>{source.charAt(0).toUpperCase() + source.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Remote only */}
                    <div class="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remote"
                            checked={localFilters.remote === 'true'}
                            onChange={(e) => updateFilter('remote', (e.target as HTMLInputElement).checked ? 'true' : '')}
                            class="w-4 h-4 text-primary-600 rounded border-slate-300"
                        />
                        <label for="remote" class="text-sm text-slate-700 dark:text-slate-300">
                            Remote only
                        </label>
                    </div>

                    {/* Action buttons */}
                    <div class="flex gap-2 pt-2">
                        <button
                            onClick={applyFilters}
                            class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Apply
                        </button>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                class="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
