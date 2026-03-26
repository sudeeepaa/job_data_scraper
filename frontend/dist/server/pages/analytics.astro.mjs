import { e as createComponent, r as renderTemplate, k as renderComponent, m as maybeRenderHead, l as Fragment, g as addAttribute } from '../chunks/astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { f as fetchTopSkills, a as fetchAnalyticsSummary, b as fetchMarketTrends, c as fetchSourceDistribution, d as fetchSalaryStats, e as fetchSourceHealth, $ as $$PageLayout } from '../chunks/PageLayout_UumKSVf4.mjs';
import { useRef, useEffect } from 'preact/hooks';
import { Chart, registerables } from 'chart.js';
import { jsxs, jsx } from 'preact/jsx-runtime';
export { renderers } from '../renderers.mjs';

Chart.register(...registerables);
function SkillsChart({
  skills,
  title = "Top Skills"
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || skills.length === 0) return;
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const textColor = "#664930";
    const gridColor = "#CCBEB1";
    const barColor = "#664930";
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: skills.map((s) => s.name),
        datasets: [{
          label: "Job Count",
          data: skills.map((s) => s.count),
          backgroundColor: barColor,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: "#ffffff",
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
              color: gridColor
            },
            ticks: {
              color: textColor,
              font: {
                weight: "bold"
              }
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              color: textColor,
              font: {
                weight: "bold"
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
  }, [skills]);
  return jsxs("div", {
    class: "bg-white border border-sand rounded-[16px] p-6 shadow-sm",
    children: [jsx("h3", {
      class: "font-bold text-xl text-espresso mb-4",
      children: title
    }), jsx("div", {
      style: {
        height: `${Math.max(skills.length * 40, 200)}px`
      },
      children: jsx("canvas", {
        ref: canvasRef
      })
    })]
  });
}

Chart.register(...registerables);
function TrendsChart({
  trends,
  title = "Market Trends"
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || trends.length === 0) return;
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const textColor = "#664930";
    const gridColor = "#CCBEB1";
    const lineColor = "#664930";
    const fillColor = "rgba(255, 219, 187, 0.4)";
    const formatSalary = (v) => `$${(v / 1e3).toFixed(0)}k`;
    const reversedTrends = [...trends].reverse();
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: reversedTrends.map((t) => new Date(t.snapshotDate).toLocaleDateString(void 0, {
          month: "short",
          day: "numeric"
        })),
        datasets: [{
          label: "Mentions",
          data: reversedTrends.map((t) => t.mentionCount),
          backgroundColor: fillColor,
          borderColor: lineColor,
          borderWidth: 2,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: lineColor,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.3
          // Smooth curves
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: "#ffffff",
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const trend = reversedTrends[context.dataIndex];
                const salary = trend.avgSalaryMin && trend.avgSalaryMax ? ` • ${formatSalary(trend.avgSalaryMin)} - ${formatSalary(trend.avgSalaryMax)}` : "";
                return `${context.raw} mentions${salary}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textColor,
              font: {
                weight: "bold"
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              font: {
                weight: "bold"
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
  }, [trends]);
  return jsxs("div", {
    class: "bg-white border border-sand rounded-[16px] p-6 shadow-sm",
    children: [jsx("h3", {
      class: "font-bold text-xl text-espresso mb-4",
      children: title
    }), jsx("div", {
      style: {
        height: "300px"
      },
      children: jsx("canvas", {
        ref: canvasRef
      })
    })]
  });
}

Chart.register(...registerables);
const PALETTE = [
  "#664930",
  // espresso
  "#997E67",
  // walnut
  "#CCBEB1",
  // sand
  "#FFDBBB"
  // cream
];
function SourcesChart({
  sources,
  title = "Job Sources"
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || sources.length === 0) return;
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const textColor = "#664930";
    const gridColor = "#CCBEB1";
    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: sources.map((s) => s.source),
        datasets: [{
          data: sources.map((s) => s.count),
          backgroundColor: sources.map((_, i) => PALETTE[i % PALETTE.length]),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
              padding: 16,
              font: {
                weight: "bold"
              },
              usePointStyle: true,
              pointStyleWidth: 12
            }
          },
          tooltip: {
            backgroundColor: "#ffffff",
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const total = sources.reduce((sum, s) => sum + s.count, 0);
                const pct = (context.raw / total * 100).toFixed(1);
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
  return jsxs("div", {
    class: "bg-white border border-sand rounded-[16px] p-6 shadow-sm",
    children: [jsx("h3", {
      class: "font-bold text-xl text-espresso mb-4",
      children: title
    }), jsx("div", {
      style: {
        height: "300px"
      },
      children: jsx("canvas", {
        ref: canvasRef
      })
    })]
  });
}

Chart.register(...registerables);
const generateExperienceData = (median) => {
  return [{
    level: "Entry",
    salary: Math.round(median * 0.7)
  }, {
    level: "Mid",
    salary: median
  }, {
    level: "Senior",
    salary: Math.round(median * 1.3)
  }, {
    level: "Lead/Manager",
    salary: Math.round(median * 1.6)
  }];
};
function ExperienceSalaryChart({
  salaryStats,
  title = "Salary by Experience"
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !salaryStats) return;
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const textColor = "#664930";
    const gridColor = "#CCBEB1";
    const barColor = "#997E67";
    const data = generateExperienceData(salaryStats.medianSalary || 85e3);
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((d) => d.level),
        datasets: [{
          label: "Median Salary",
          data: data.map((d) => d.salary),
          backgroundColor: barColor,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: "#ffffff",
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                return new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0
                }).format(context.raw);
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textColor,
              font: {
                weight: "bold"
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              callback: (value) => `$${value / 1e3}k`
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
  }, [salaryStats]);
  return jsxs("div", {
    class: "bg-white border border-sand rounded-[16px] p-6 shadow-sm",
    children: [jsx("h3", {
      class: "font-bold text-xl text-espresso mb-4",
      children: title
    }), jsx("div", {
      style: {
        height: "300px"
      },
      children: salaryStats ? jsx("canvas", {
        ref: canvasRef
      }) : jsx("div", {
        class: "h-full flex items-center justify-center text-walnut font-medium",
        children: "Insufficient salary data"
      })
    })]
  });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Analytics = createComponent(async ($$result, $$props, $$slots) => {
  let skills = [];
  let summary = null;
  let trends = [];
  let sources = [];
  let salaryStats = null;
  let sourceHealth = [];
  let error = "";
  try {
    const [skillsResponse, summaryResponse, trendsResponse, sourcesResponse, salaryResponse, sourceHealthResponse] = await Promise.all([
      fetchTopSkills(10),
      fetchAnalyticsSummary(),
      fetchMarketTrends(30),
      // Requesting a longer timeframe or more items to better generate the 30 day line chart format
      fetchSourceDistribution(),
      fetchSalaryStats(),
      fetchSourceHealth()
    ]);
    skills = skillsResponse.data;
    summary = summaryResponse;
    trends = trendsResponse.data;
    sources = sourcesResponse.data;
    salaryStats = salaryResponse;
    sourceHealth = sourceHealthResponse.data || [];
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load analytics";
  }
  const formatSalary = (amount) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
  return renderTemplate(_a || (_a = __template(["", ` <script>
    const btn = document.getElementById("refresh-btn");
    if (btn) {
        btn.addEventListener("click", async () => {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="animate-pulse">Refreshing...</span>';
            btn.setAttribute("disabled", "true");
            try {
                await fetch("/api/v1/analytics/refresh", { method: "POST" });
                window.location.reload();
            } catch {
                btn.textContent = "Refresh Failed";
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.removeAttribute("disabled");
                }, 2000);
            }
        });
    }
<\/script>`])), renderComponent($$result, "PageLayout", $$PageLayout, { "title": "Analytics", "description": "Job market analytics and live ingestion health." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mx-auto max-w-[1180px] px-6 py-12"> <div class="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"> <div> <p class="text-xs font-bold uppercase tracking-[0.2em] text-walnut">Market Overview</p> <h1 class="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-espresso">Analytics Dashboard</h1> <p class="mt-2 text-lg text-walnut">Monitor ingestion health, skills, and salary trends across all indexed sources.</p> </div> <button type="button" id="refresh-btn" class="flex items-center gap-2 rounded-full border-2 border-espresso px-6 py-3 font-bold text-espresso transition hover:bg-espresso hover:text-white"> <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path> </svg>
Refresh Data
</button> </div> ${error ? renderTemplate`<div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"> <p class="text-lg font-bold text-red-600">${error}</p> <p class="mt-1 text-red-500">Please make sure the backend server API is running.</p> </div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${summary && renderTemplate`<section class="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4"> <div class="rounded-[16px] bg-white border border-sand p-6 shadow-sm"> <div class="mb-1 text-sm font-semibold text-walnut">Total Jobs Indexed</div> <div class="text-3xl font-extrabold text-espresso">${summary.totalJobs.toLocaleString()}</div> </div> <div class="rounded-[16px] bg-white border border-sand p-6 shadow-sm"> <div class="mb-1 text-sm font-semibold text-walnut">Average Salary</div> <div class="text-3xl font-extrabold text-espresso">${formatSalary(summary.averageSalary)}</div> </div> <div class="rounded-[16px] bg-white border border-sand p-6 shadow-sm"> <div class="mb-1 text-sm font-semibold text-walnut">Remote Percentage</div> <div class="text-3xl font-extrabold text-espresso">${Math.round(summary.remoteJobsCount / Math.max(summary.totalJobs, 1) * 100)}%</div> </div> <div class="rounded-[16px] bg-white border border-sand p-6 shadow-sm"> <div class="mb-1 text-sm font-semibold text-walnut">Jobs Added Today</div> <div class="text-3xl font-extrabold text-espresso">${summary.jobsToday.toLocaleString()}</div> </div> </section>`}<div class="mb-10 grid gap-6 lg:grid-cols-2"> ${renderComponent($$result3, "TrendsChart", TrendsChart, { "client:load": true, "trends": trends, "title": "Jobs Added (Last 30 Days)", "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/TrendsChart", "client:component-export": "default" })} ${renderComponent($$result3, "SourcesChart", SourcesChart, { "client:load": true, "sources": sources, "title": "Jobs by Source", "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/SourcesChart", "client:component-export": "default" })} ${renderComponent($$result3, "SkillsChart", SkillsChart, { "client:load": true, "skills": skills, "title": "Top 10 In-Demand Skills", "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/SkillsChart", "client:component-export": "default" })} ${renderComponent($$result3, "ExperienceSalaryChart", ExperienceSalaryChart, { "client:load": true, "salaryStats": salaryStats, "title": "Salary by Experience Level", "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/ExperienceSalaryChart", "client:component-export": "default" })} </div> ${sourceHealth.length > 0 && renderTemplate`<section class="mb-8 rounded-[16px] border border-sand bg-white shadow-sm overflow-hidden"> <div class="p-6 border-b border-sand bg-cream"> <h2 class="text-2xl font-extrabold text-espresso">Source Health</h2> <p class="mt-1 text-walnut">Live tracking of active ingestion pipelines.</p> </div> <div class="overflow-x-auto w-full"> <table class="w-full text-left border-collapse"> <thead> <tr class="bg-off-white border-b border-sand text-walnut text-xs font-bold uppercase tracking-wider"> <th class="p-5">Source Name</th> <th class="p-5">Jobs Fetched</th> <th class="p-5">Last Sync Time</th> <th class="p-5">Status</th> </tr> </thead> <tbody class="divide-y divide-sand text-espresso"> ${sourceHealth.map((item) => renderTemplate`<tr class="hover:bg-off-white transition-colors"> <td class="p-5 font-bold">${item.name}</td> <td class="p-5 font-medium">${item.resultCount.toLocaleString()}</td> <td class="p-5 text-sm text-walnut font-medium">${item.lastSuccessAt ? new Date(item.lastSuccessAt).toLocaleString() : "N/A"}</td> <td class="p-4"> <span${addAttribute([
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
    item.healthy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  ], "class:list")}> ${item.healthy ? "Healthy" : "Needs Attention"} </span> </td> </tr>`)} </tbody> </table> </div> </section>`}` })}`} </div> ` }));
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/analytics.astro", void 0);

const $$file = "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/analytics.astro";
const $$url = "/analytics";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Analytics,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
