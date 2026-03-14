import { useState } from "preact/hooks";
import { login, register } from "../../lib/api";
import { setToken } from "../../lib/auth";

interface Props {
    mode: "register" | "login";
}

export default function AuthForm({ mode }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response =
                mode === "register"
                    ? await register(email, password, name)
                    : await login(email, password);

            setToken(response.token);
            window.location.href = "/auth/profile";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} class="space-y-6">
            {error && (
                <div class="rounded-[1.2rem] border border-[rgba(255,108,95,0.3)] bg-[rgba(255,108,95,0.1)] px-5 py-4 text-base font-medium text-[var(--jh-coral)]">
                    {error}
                </div>
            )}

            {mode === "register" && (
                <div>
                    <label class="mb-2 block text-lg font-semibold tracking-[-0.03em] text-slate-800">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onInput={(e) => setName((e.target as HTMLInputElement).value)}
                        required
                        class="w-full rounded-[1.35rem] border border-[var(--jh-border)] bg-white px-5 py-4 text-lg text-slate-900 outline-none focus:border-[var(--jh-primary)]"
                        placeholder="Enter your full name"
                    />
                </div>
            )}

            <div>
                <label class="mb-2 block text-lg font-semibold tracking-[-0.03em] text-slate-800">
                    Email Address
                </label>
                <input
                    type="email"
                    value={email}
                    onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                    required
                    class="w-full rounded-[1.35rem] border border-[var(--jh-border)] bg-white px-5 py-4 text-lg text-slate-900 outline-none focus:border-[var(--jh-primary)]"
                    placeholder="Enter email address"
                />
            </div>

            <div>
                <label class="mb-2 block text-lg font-semibold tracking-[-0.03em] text-slate-800">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                    required
                    minLength={6}
                    class="w-full rounded-[1.35rem] border border-[var(--jh-border)] bg-white px-5 py-4 text-lg text-slate-900 outline-none focus:border-[var(--jh-primary)]"
                    placeholder="Enter password"
                />
            </div>

            <label class="flex items-center gap-3 text-lg text-slate-600">
                <input type="checkbox" defaultChecked class="h-5 w-5 rounded border-[var(--jh-border)] text-[var(--jh-primary)]" />
                Remember me
            </label>

            <button
                type="submit"
                disabled={loading}
                class="w-full rounded-[1.35rem] bg-[linear-gradient(135deg,var(--jh-primary)_0%,var(--jh-primary-strong)_100%)] px-5 py-4 text-xl font-bold tracking-[-0.04em] text-white shadow-[0_20px_45px_rgba(79,70,229,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
            >
                {loading
                    ? mode === "register"
                        ? "Creating account..."
                        : "Signing in..."
                    : mode === "register"
                      ? "Continue"
                      : "Login"}
            </button>

            <p class="pt-2 text-center text-lg text-slate-500">
                {mode === "register" ? (
                    <>
                        Already have an account?{" "}
                        <a href="/auth/login" class="font-semibold text-[var(--jh-primary)] hover:underline">
                            Login
                        </a>
                    </>
                ) : (
                    <>
                        Don&apos;t have an account?{" "}
                        <a href="/auth/register" class="font-semibold text-[var(--jh-primary)] hover:underline">
                            Sign Up
                        </a>
                    </>
                )}
            </p>
        </form>
    );
}
