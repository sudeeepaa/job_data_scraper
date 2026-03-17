import { useState, useRef } from 'preact/hooks';

interface Props {
    jobTitle: string;
    jobDescription: string;
}

export default function MatchResume({ jobTitle, jobDescription }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [isMatching, setIsMatching] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: any) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setScore(null);
        }
    };

    const runMatch = async () => {
        if (!file) return;
        
        setIsMatching(true);
        
        // Mocking the AI matching process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockScore = Math.floor(Math.random() * 40) + 60; // 60-99
        setScore(mockScore);
        setIsMatching(false);
        
        setFeedback([
            "Strong match for required technical skills.",
            "Relevant experience in similar industries.",
            "Consider highlighting more project management experience."
        ]);
    };

    return (
        <div class="glass-card p-8 animate-in mt-10">
            <div class="flex items-center gap-4 mb-6">
                <div class="h-12 w-12 rounded-2xl bg-[var(--jp-accent)]/10 flex items-center justify-center text-2xl">
                    🎯
                </div>
                <div>
                    <h3 class="text-2xl font-bold tracking-tight">Match My Resume</h3>
                    <p class="text-sm text-[var(--jp-text-muted)] font-medium">See how well your profile aligns with this role.</p>
                </div>
            </div>

            {!score && !isMatching ? (
                <div 
                    class="border-2 border-dashed border-[var(--jp-border)] rounded-2xl p-10 text-center hover:border-[var(--jp-accent)]/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        class="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                    />
                    <div class="text-4xl mb-4">📄</div>
                    {file ? (
                        <p class="text-[var(--jp-text-primary)] font-bold">{file.name}</p>
                    ) : (
                        <>
                            <p class="text-[var(--jp-text-primary)] font-bold mb-1">Click to upload your resume</p>
                            <p class="text-xs text-[var(--jp-text-muted)]">PDF, DOCX up to 5MB</p>
                        </>
                    )}
                </div>
            ) : null}

            {isMatching && (
                <div class="py-12 text-center">
                    <div class="w-12 h-12 border-4 border-[var(--jp-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-[var(--jp-text-primary)] font-bold">Analyzing alignment...</p>
                </div>
            )}

            {score !== null && !isMatching && (
                <div class="space-y-6">
                    <div class="flex items-center justify-between">
                        <div class="text-5xl font-bold tracking-tighter text-[var(--jp-accent)]">
                            {score}%
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-bold uppercase tracking-widest text-[var(--jp-text-muted)]">Alignment Score</p>
                            <p class="text-[var(--jp-text-primary)] font-bold">Strong Match</p>
                        </div>
                    </div>

                    <div class="h-3 bg-[var(--jp-surface)] rounded-full overflow-hidden border border-[var(--jp-border)]">
                        <div 
                            class="h-full bg-gradient-to-r from-[var(--jp-accent)] to-[#F97316] transition-all duration-1000" 
                            style={{ width: `${score}%` }}
                        ></div>
                    </div>

                    <div class="space-y-3 pt-4 border-t border-[var(--jp-border)]">
                        <p class="text-sm font-bold uppercase tracking-widest text-[var(--jp-text-muted)]">Expert Insights</p>
                        <ul class="space-y-2">
                            {feedback.map(item => (
                                <li class="flex items-start gap-3 text-sm text-[var(--jp-text-primary)] font-medium">
                                    <span class="text-[var(--jp-accent)]">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button 
                        onClick={() => { setScore(null); setFile(null); }}
                        class="w-full py-3 rounded-xl border border-[var(--jp-border)] text-sm font-bold hover:bg-[var(--jp-surface)] transition-colors"
                    >
                        Try with another resume
                    </button>
                </div>
            )}

            {!score && file && !isMatching && (
                <button 
                    onClick={runMatch}
                    class="w-full mt-6 btn-primary py-4 rounded-xl text-lg font-bold"
                >
                    Run Match Check
                </button>
            )}
        </div>
    );
}
