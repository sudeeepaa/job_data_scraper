import { e as createComponent, m as maybeRenderHead, g as addAttribute, k as renderComponent, r as renderTemplate, h as createAstro } from './astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { useState } from 'preact/hooks';
import { u as unsaveJob, s as saveJob } from './PageLayout_UumKSVf4.mjs';
import { jsx, jsxs } from 'preact/jsx-runtime';
import { b as formatCompactSalary, g as getInitials, s as sourceLabel, c as formatPostedDate } from './job-ui_D_r7-dBy.mjs';

function SaveJobButton({
  jobId,
  initialSaved = false
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      if (saved) {
        await unsaveJob(jobId);
        setSaved(false);
      } else {
        await saveJob(jobId);
        setSaved(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (message.includes("unauthorized")) {
        window.location.href = "/auth/login";
      }
    } finally {
      setLoading(false);
    }
  };
  return jsx("button", {
    onClick: handleClick,
    disabled: loading,
    class: `rounded-[12px] border px-4 py-4 transition-colors ${saved ? "border-cream bg-cream text-espresso" : "border-sand bg-white text-walnut hover:border-espresso hover:text-espresso"}`,
    title: saved ? "Remove from saved" : "Save job",
    children: loading ? jsxs("svg", {
      class: "h-5 w-5 animate-spin",
      fill: "none",
      viewBox: "0 0 24 24",
      children: [jsx("circle", {
        class: "opacity-25",
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "currentColor",
        "stroke-width": "4"
      }), jsx("path", {
        class: "opacity-75",
        fill: "currentColor",
        d: "M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.95 7.95 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z"
      })]
    }) : jsx("svg", {
      class: "h-5 w-5",
      fill: saved ? "currentColor" : "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      children: jsx("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: "M4.32 6.32a4.5 4.5 0 000 6.36L12 20.36l7.68-7.68a4.5 4.5 0 00-6.36-6.36L12 7.64l-1.32-1.32a4.5 4.5 0 00-6.36 0z"
      })
    })
  });
}

function MatchScoreBadge({
  score
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  if (!score || score <= 0) return null;
  let ringColor;
  let textColor;
  let bgColor;
  let label;
  if (score >= 71) {
    ringColor = "#664930";
    textColor = "#FFDBBB";
    bgColor = "#664930";
    label = "Strong match";
  } else if (score >= 41) {
    ringColor = "#CCBEB1";
    textColor = "#664930";
    bgColor = "transparent";
    label = "Good match";
  } else {
    ringColor = "#997E67";
    textColor = "#997E67";
    bgColor = "transparent";
    label = "Low match";
  }
  const size = 56;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - score / 100 * circumference;
  return jsxs("div", {
    class: "relative inline-flex flex-col items-center",
    onMouseEnter: () => setShowTooltip(true),
    onMouseLeave: () => setShowTooltip(false),
    children: [jsxs("div", {
      class: "relative",
      style: {
        width: `${size}px`,
        height: `${size}px`
      },
      children: [jsxs("svg", {
        width: size,
        height: size,
        viewBox: `0 0 ${size} ${size}`,
        style: {
          transform: "rotate(-90deg)"
        },
        children: [jsx("circle", {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          fill: bgColor,
          stroke: bgColor === "transparent" ? "#FAF7F4" : "transparent",
          "stroke-width": strokeWidth
        }), jsx("circle", {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          fill: "none",
          stroke: ringColor,
          "stroke-width": strokeWidth,
          "stroke-dasharray": circumference,
          "stroke-dashoffset": dashOffset,
          "stroke-linecap": "round",
          style: {
            transition: "stroke-dashoffset 0.5s ease"
          }
        })]
      }), jsx("div", {
        class: "absolute inset-0 flex flex-col items-center justify-center",
        style: {
          color: textColor
        },
        children: jsxs("span", {
          class: "text-sm font-extrabold leading-none",
          children: [score, "%"]
        })
      })]
    }), jsx("span", {
      class: "text-[10px] font-bold mt-1 whitespace-nowrap leading-none",
      style: {
        color: textColor === "#FFDBBB" ? "#664930" : textColor
      },
      children: label
    }), showTooltip && jsxs("div", {
      class: "absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[6px] px-3 py-1.5 text-xs font-semibold shadow-md z-50",
      style: {
        backgroundColor: "#664930",
        color: "#FFDBBB"
      },
      children: ["Based on skill overlap with your profile", jsx("div", {
        class: "absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45",
        style: {
          backgroundColor: "#664930"
        }
      })]
    })]
  });
}

const $$Astro = createAstro();
const $$JobCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$JobCard;
  const { job, mode = "grid" } = Astro2.props;
  const isGrid = mode === "grid";
  const salary = formatCompactSalary(job);
  const tags = job.skills.slice(0, 4);
  return renderTemplate`${maybeRenderHead()}<article${addAttribute([
    "relative bg-white border border-sand border-left-[3px] border-left-espresso rounded-[12px] overflow-hidden shadow-[0_2px_8px_rgba(102,73,48,0.08)] hover:shadow-[0_6px_20px_rgba(102,73,48,0.15)] hover:-translate-y-0.5 transition-all",
    isGrid ? "flex h-full flex-col p-6" : "grid gap-6 p-7 lg:grid-cols-[1fr_auto]"
  ], "class:list")}> ${job.matchScore && job.matchScore > 0 && renderTemplate`<div class="absolute top-4 right-4 z-10"> ${renderComponent($$result, "MatchScoreBadge", MatchScoreBadge, { "client:load": true, "score": job.matchScore, "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/MatchScoreBadge", "client:component-export": "default" })} </div>`} <div${addAttribute([isGrid ? "flex h-full flex-col" : "flex min-w-0 items-start gap-5"], "class:list")}> <div class="flex items-start gap-5"> <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-cream text-lg font-bold tracking-tight text-espresso"> ${getInitials(job.company)} </div> <div class="min-w-0"> <div class="mb-2 flex flex-wrap items-center gap-2"> ${job.isRemote && renderTemplate`<span class="bg-cream text-espresso rounded px-2 py-0.5 text-xs font-semibold">Remote</span>`} <span class="bg-sand-100 text-walnut px-2 py-0.5 text-xs font-semibold rounded">${sourceLabel(job.source)}</span> </div> <a${addAttribute(`/jobs/${job.id}`, "href")} class="group block"> <h3${addAttribute([
    "font-semibold leading-tight tracking-tight text-espresso transition-colors",
    isGrid ? "text-[1.25rem] line-clamp-2" : "text-[1.5rem]"
  ], "class:list")}> ${job.title} </h3> </a> <div${addAttribute([
    "mt-2 text-walnut font-medium",
    isGrid ? "text-sm" : "text-base"
  ], "class:list")}> <a${addAttribute(`/companies/${job.companySlug}`, "href")} class="text-espresso hover:underline">${job.company}</a> <span> • ${job.location}</span> </div> </div> </div> <div${addAttribute([isGrid ? "mt-8 flex-1" : "min-w-0 flex-1"], "class:list")}> <div class="mt-4 flex flex-wrap gap-2"> ${tags.length > 0 ? tags.map((tag, index) => renderTemplate`<span class="bg-sand-100 text-walnut px-2.5 py-1 text-sm font-medium rounded max-w-full truncate"${addAttribute(tag, "title")}>${tag}</span>`) : renderTemplate`<span class="bg-sand-100 text-walnut px-2.5 py-1 text-sm font-medium rounded max-w-full truncate"${addAttribute(job.experienceLevel, "title")}>${job.experienceLevel}</span>`} </div> <div class="mt-4 text-sm font-medium text-walnut">Live opportunity from ${sourceLabel(job.source)}</div> </div> </div> <div${addAttribute([isGrid ? "mt-7 flex flex-col gap-4" : "flex flex-col items-end justify-between gap-4 lg:min-w-[15rem]"], "class:list")}> <div${addAttribute([isGrid ? "text-left" : "text-right"], "class:list")}> ${salary ? renderTemplate`<div${addAttribute([
    "font-bold text-espresso",
    isGrid ? "text-lg" : "text-xl"
  ], "class:list")}>${salary}</div>` : renderTemplate`<div class="text-lg font-bold text-walnut">Competitive pay</div>`} <div class="mt-2 text-sm font-medium text-walnut">Posted ${formatPostedDate(job.postedAt)}</div> <div class="mt-1 text-sm font-medium text-walnut capitalize">${job.experienceLevel}</div> </div> <div${addAttribute([isGrid ? "flex items-center gap-3" : "flex items-center gap-3 self-start lg:self-auto"], "class:list")}> ${renderComponent($$result, "SaveJobButton", SaveJobButton, { "client:load": true, "jobId": job.id, "initialSaved": job.isSaved, "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/SaveJobButton", "client:component-export": "default" })} <a${addAttribute(`/jobs/${job.id}`, "href")}${addAttribute(["bg-espresso text-white hover:bg-walnut transition-colors rounded-[8px] font-semibold py-3.5", isGrid ? "flex-1 text-center justify-center px-5" : "px-6"], "class:list")}>View Job</a> </div> </div> </article>`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/jobs/JobCard.astro", void 0);

export { $$JobCard as $, SaveJobButton as S };
