import { useEffect, useRef } from 'preact/hooks';
import { Chart, registerables } from 'chart.js';
import type { SourceDistribution } from '../../types';

Chart.register(...registerables);

interface Props {
    sources: SourceDistribution[];
    title?: string;
}

const SOURCE_COLORS: Record<string, string> = {
    linkedin: 'rgba(10, 102, 194, 0.85)',
    indeed: 'rgba(147, 51, 234, 0.85)',
    adzuna: 'rgba(249, 115, 22, 0.85)',
    scraper: 'rgba(234, 179, 8, 0.85)',
};

const DEFAULT_COLOR = 'rgba(107, 114, 128, 0.85)';

export default function SourcesChart({ sources, title = 'Job Sources' }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current || sources.length === 0) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e2e8f0' : '#334155';

        chartRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sources.map(s => s.source),
                datasets: [{
                    data: sources.map(s => s.count),
                    backgroundColor: sources.map(s => SOURCE_COLORS[s.source] || DEFAULT_COLOR),
                    borderColor: isDark ? '#1e293b' : '#ffffff',
                    borderWidth: 3,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 16,
                            usePointStyle: true,
                            pointStyleWidth: 12,
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => {
                                const total = sources.reduce((sum, s) => sum + s.count, 0);
                                const pct = ((context.raw as number) / total * 100).toFixed(1);
                                return `${context.raw} jobs (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [sources]);

    return (
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-4">{title}</h3>
            <div style={{ height: '300px' }}>
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
}
