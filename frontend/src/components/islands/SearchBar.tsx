import { useState, useRef, useEffect } from 'preact/hooks';

interface Props {
    initialQuery?: string;
    placeholder?: string;
}

export default function SearchBar({ initialQuery = '', placeholder = 'Search jobs, companies, or skills...' }: Props) {
    const [query, setQuery] = useState(initialQuery);
    const [isFocused, setIsFocused] = useState(false);
    const debounceRef = useRef<number>();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        if (query.trim()) {
            window.location.href = `/jobs?q=${encodeURIComponent(query.trim())}`;
        }
    };

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    return (
        <form onSubmit={handleSubmit} class="relative w-full max-w-2xl">
            <div class={`
        flex items-center gap-3 px-4 py-3 
        bg-white dark:bg-slate-800 
        border-2 rounded-xl
        transition-all duration-200
        ${isFocused
                    ? 'border-primary-500 shadow-lg shadow-primary-500/10'
                    : 'border-slate-200 dark:border-slate-700'
                }
      `}>
                {/* Search icon */}
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    class="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
                    aria-label="Search"
                />

                {/* Clear button */}
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    class="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    Search
                </button>
            </div>
        </form>
    );
}
