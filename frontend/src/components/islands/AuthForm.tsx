import { useState } from "preact/hooks";
import { login, register } from "../../lib/api";

interface Props {
    mode: "register" | "login";
}

export default function AuthForm({ mode }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const validate = () => {
        const normalizedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        const passwordIsStrong = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

        if (mode === "register" && trimmedName.length < 2) {
            return "Please enter your full name.";
        }

        if (!normalizedEmail) {
            return "Please enter your email address.";
        }

        if (!passwordIsStrong) {
            return "Password must be at least 8 characters and include letters and numbers.";
        }

        return "";
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError("");
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setLoading(true);

        try {
            const response =
                mode === "register"
                    ? await register(email.trim().toLowerCase(), password, name.trim(), rememberMe)
                    : await login(email.trim().toLowerCase(), password, rememberMe);

            if (!response.user?.id) {
                throw new Error("Authentication succeeded, but the session was not created.");
            }

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
                    minLength={8}
                    class="w-full rounded-[1.35rem] border border-[var(--jh-border)] bg-white px-5 py-4 text-lg text-slate-900 outline-none focus:border-[var(--jh-primary)]"
                    placeholder="Enter password"
                />
                <p class="mt-2 text-sm text-slate-400">Use at least 8 characters with letters and numbers.</p>
            </div>

            <label class="flex items-center gap-3 text-lg text-slate-600">
                <input
                    type="checkbox"
                    checked={rememberMe}
                    onInput={(e) => setRememberMe((e.target as HTMLInputElement).checked)}
                    class="h-5 w-5 rounded border-[var(--jh-border)] text-[var(--jh-primary)]"
                />
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
