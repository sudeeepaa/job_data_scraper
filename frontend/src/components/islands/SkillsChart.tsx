import { useEffect, useRef } from 'preact/hooks';
import { Chart, registerables } from 'chart.js';
import type { SkillCount } from '../../types';

Chart.register(...registerables);

interface Props {
    skills: SkillCount[];
    title?: string;
}

export default function SkillsChart({ skills, title = 'Top Skills' }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current || skills.length === 0) return;

        // Destroy existing chart
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Check if dark mode
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e2e8f0' : '#334155';
        const gridColor = isDark ? '#334155' : '#e2e8f0';

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: skills.map(s => s.name),
                datasets: [{
                    label: 'Job Count',
                    data: skills.map(s => s.count),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `${context.raw} jobs`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor,
                        },
                        ticks: {
                            color: textColor,
                        }
                    },
                    y: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: textColor,
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
    }, [skills]);

    return (
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-4">{title}</h3>
            <div style={{ height: `${Math.max(skills.length * 40, 200)}px` }}>
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
}
