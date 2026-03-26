import { useEffect, useRef } from 'preact/hooks';
import { Chart, registerables } from 'chart.js';
import type { MarketTrend } from '../../types';

Chart.register(...registerables);

interface Props {
    trends: MarketTrend[];
    title?: string;
}

export default function TrendsChart({ trends, title = 'Market Trends' }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current || trends.length === 0) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e2e8f0' : '#334155';
        const gridColor = isDark ? '#334155' : '#e2e8f0';

        const formatSalary = (v: number) => `$${(v / 1000).toFixed(0)}k`;

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: trends.map(t => t.skillName),
                datasets: [{
                    label: 'Mentions',
                    data: trends.map(t => t.mentionCount),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                const trend = trends[context.dataIndex];
                                const salary = trend.avgSalaryMin && trend.avgSalaryMax
                                    ? ` • ${formatSalary(trend.avgSalaryMin)} - ${formatSalary(trend.avgSalaryMax)}`
                                    : '';
                                return `${context.raw} mentions${salary}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: textColor }
                    }
                }
            }
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [trends]);

    return (
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-4">{title}</h3>
            <div style={{ height: `${Math.max(trends.length * 40, 200)}px` }}>
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
}
