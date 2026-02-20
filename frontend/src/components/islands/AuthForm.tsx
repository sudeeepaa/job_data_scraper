import { useState } from 'preact/hooks';
import { register, login } from '../../lib/api';
import { setToken } from '../../lib/auth';

interface Props {
    mode: 'register' | 'login';
}

export default function AuthForm({ mode }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = mode === 'register'
                ? await register(email, password, name)
                : await login(email, password);

            setToken(response.token);
            window.location.href = '/auth/profile';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} class="space-y-5">
            {error && (
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {mode === 'register' && (
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onInput={(e) => setName((e.target as HTMLInputElement).value)}
                        required
                        class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow"
                        placeholder="John Doe"
                    />
                </div>
            )}

            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                </label>
                <input
                    type="email"
                    value={email}
                    onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                    required
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                    required
                    minLength={6}
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                class="w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
                {loading
                    ? (mode === 'register' ? 'Creating account...' : 'Signing in...')
                    : (mode === 'register' ? 'Create Account' : 'Sign In')
                }
            </button>

            <p class="text-center text-sm text-slate-500 dark:text-slate-400">
                {mode === 'register' ? (
                    <>Already have an account? <a href="/auth/login" class="text-primary-600 dark:text-primary-400 hover:underline">Sign in</a></>
                ) : (
                    <>Don't have an account? <a href="/auth/register" class="text-primary-600 dark:text-primary-400 hover:underline">Create one</a></>
                )}
            </p>
        </form>
    );
}
