import { e as createComponent, m as maybeRenderHead, g as addAttribute, r as renderTemplate, h as createAstro, k as renderComponent, l as Fragment } from '../chunks/astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { j as fetchJobs, k as fetchFilters, e as fetchSourceHealth, $ as $$PageLayout } from '../chunks/PageLayout_UumKSVf4.mjs';
import { $ as $$JobCard } from '../chunks/JobCard_CDhFlij3.mjs';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro();
const $$Pagination = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Pagination;
  const { currentPage, totalPages, baseUrl } = Astro2.props;
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || i >= currentPage - delta && i <= currentPage + delta) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };
  const pageNumbers = getPageNumbers();
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const getPageUrl = (page) => {
    const url = new URL(baseUrl, Astro2.url);
    url.searchParams.set("page", page.toString());
    return url.pathname + url.search;
  };
  return renderTemplate`${totalPages > 1 && renderTemplate`${maybeRenderHead()}<nav class="flex items-center justify-center gap-2" aria-label="Pagination"><!-- Previous -->${prevPage ? renderTemplate`<a${addAttribute(getPageUrl(prevPage), "href")} class="rounded-[1rem] border border-[var(--jh-border)] bg-white px-4 py-3 text-base font-semibold text-slate-600 hover:border-[var(--jh-primary)] hover:text-[var(--jh-primary)]">
←
</a>` : renderTemplate`<span class="cursor-not-allowed rounded-[1rem] border border-[var(--jh-border)] px-4 py-3 text-base font-semibold text-slate-300">
←
</span>`}<!-- Page numbers --><div class="hidden sm:flex items-center gap-1">${pageNumbers.map((page) => page === "..." ? renderTemplate`<span class="px-3 py-2 text-sm text-slate-400">...</span>` : renderTemplate`<a${addAttribute(getPageUrl(page), "href")}${addAttribute([
    "rounded-[1rem] px-4 py-3 text-base font-semibold",
    page === currentPage ? "bg-[var(--jh-primary)] text-white shadow-[0_18px_35px_rgba(99,91,255,0.2)]" : "text-slate-600 hover:bg-[var(--jh-soft)] hover:text-[var(--jh-primary)]"
  ], "class:list")}>${page}</a>`)}</div><!-- Mobile page indicator --><span class="sm:hidden px-3 py-2 text-sm text-slate-600">
Page ${currentPage} of ${totalPages}</span><!-- Next -->${nextPage ? renderTemplate`<a${addAttribute(getPageUrl(nextPage), "href")} class="rounded-[1rem] border border-[var(--jh-border)] bg-white px-4 py-3 text-base font-semibold text-slate-600 hover:border-[var(--jh-primary)] hover:text-[var(--jh-primary)]">
→
</a>` : renderTemplate`<span class="cursor-not-allowed rounded-[1rem] border border-[var(--jh-border)] px-4 py-3 text-base font-semibold text-slate-300">
→
</span>`}</nav>`}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/common/Pagination.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const url = Astro2.url;
  const query = url.searchParams.get("q") || "";
  const location = url.searchParams.get("location") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const experience = url.searchParams.get("experience") || "";
  const source = url.searchParams.get("source") || "";
  const employmentType = url.searchParams.get("employment_type") || "";
  const remote = url.searchParams.get("remote") || "";
  const salaryMin = url.searchParams.get("salary_min") || "";
  const sort = url.searchParams.get("sort") || "date";
  const view = url.searchParams.get("view") === "list" ? "list" : "grid";
  let jobsData = { data: [], pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0, hasMore: false } };
  let filtersData = { locations: [], experienceLevels: [], sources: [], skills: [] };
  let sourceHealth = [];
  let error = null;
  try {
    jobsData = await fetchJobs({
      q: query,
      location,
      page,
      experience,
      source,
      employment_type: employmentType,
      remote: remote || void 0,
      salary_min: salaryMin || void 0,
      sort
    });
    const [filtersResponse, sourceHealthResponse] = await Promise.all([
      fetchFilters(),
      fetchSourceHealth()
    ]);
    filtersData = filtersResponse;
    sourceHealth = sourceHealthResponse.data || [];
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load jobs";
  }
  const activeFilters = [];
  if (query) activeFilters.push({ label: `Query: ${query}`, key: "q" });
  if (location) activeFilters.push({ label: `Location: ${location}`, key: "location" });
  if (experience) activeFilters.push({ label: `Experience: ${experience}`, key: "experience" });
  if (source) activeFilters.push({ label: `Source: ${source}`, key: "source" });
  if (employmentType) activeFilters.push({ label: `Type: ${employmentType}`, key: "employment_type" });
  if (remote) activeFilters.push({ label: `Remote`, key: "remote" });
  if (salaryMin) activeFilters.push({ label: `Min Salary: ${salaryMin}`, key: "salary_min" });
  const removeParam = (paramKey) => {
    const newUrl = new URL(url.toString());
    newUrl.searchParams.delete(paramKey);
    return newUrl.pathname + newUrl.search;
  };
  const clearAllUrl = url.pathname;
  const healthySources = sourceHealth.filter((item) => item.healthy);
  sourceHealth.filter((item) => !item.healthy && item.lastError);
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": query ? `Find Jobs: ${query}` : "Find Jobs", "description": "Browse roles from top active sources." }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["  ", '<section class="border-b border-sand bg-off-white"> <div class="mx-auto max-w-[1180px] px-6 py-16"> <h1 class="text-[52px] font-bold tracking-tight text-espresso leading-none">Search jobs</h1> <p class="mt-4 text-walnut text-[18px] font-medium">Browse ', ' opportunities from active sources.</p> </div> </section>  <section class="mx-auto max-w-[1180px] px-6 py-10"> <div class="grid gap-10 lg:grid-cols-[20rem_1fr]"> <!-- Sidebar --> <aside class="space-y-6"> <!-- Mobile Collapsible Wrapping --> <details class="group lg:hidden mb-4 bg-cream rounded-[16px] border border-sand"> <summary class="flex justify-between items-center p-5 font-bold text-espresso cursor-pointer list-none"> <span>Filters</span> <svg class="w-5 h-5 transition group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path> </svg> </summary> <div class="p-5 pt-0"> <!-- Need to replicate form here, avoiding duplication using CSS display tricks instead --> <p class="text-sm text-walnut">Please use desktop version for full filtering experience or use the form below.</p> </div> </details> <form id="filter-form" action="/jobs" method="GET" class="hidden lg:block bg-white rounded-[16px] border border-sand p-6 shadow-sm"> <div> <h2 class="text-[20px] font-bold text-espresso mb-6">Filters</h2> </div> <div class="space-y-5"> <!-- Query --> <div> <label class="mb-2 block text-sm font-semibold text-espresso">Keywords</label> <input type="text" name="q"', ' placeholder="Job title or skill" class="w-full rounded-[8px] bg-white border border-sand px-4 py-3 text-sm text-espresso outline-none focus:border-walnut"> </div> <!-- Location --> <div> <label class="mb-2 block text-sm font-semibold text-espresso">Location</label> <input type="text" name="location"', ' placeholder="City, State, or Country" class="w-full rounded-[8px] bg-white border border-sand px-4 py-3 text-sm text-espresso outline-none focus:border-walnut"> </div> <!-- Employment Type --> <div> <label class="mb-2 block text-sm font-semibold text-espresso">Type of Employment</label> <select name="employment_type" class="w-full rounded-[8px] border border-sand bg-white px-4 py-3 text-sm text-espresso outline-none focus:border-walnut"> <option value="">All types</option> <option value="full-time"', '>Full-time</option> <option value="part-time"', '>Part-time</option> <option value="contract"', '>Contract</option> <option value="internship"', '>Internship</option> </select> </div> <!-- Experience --> <div> <label class="mb-2 block text-sm font-semibold text-espresso">Experience Level</label> <select name="experience" class="w-full rounded-[8px] border border-sand bg-white px-4 py-3 text-sm text-espresso outline-none focus:border-walnut"> <option value="">Any level</option> ', ' </select> </div> <!-- Source --> <div> <label class="mb-2 block text-sm font-semibold text-espresso">Source</label> <select name="source" class="w-full rounded-[8px] border border-sand bg-white px-4 py-3 text-sm text-espresso outline-none focus:border-walnut"> <option value="">All sources</option> ', ' </select> </div> <!-- Salary Min --> <div> <label class="mb-2 block text-sm font-semibold text-espresso">Minimum Salary</label> <select name="salary_min" class="w-full rounded-[8px] border border-sand bg-white px-4 py-3 text-sm text-espresso outline-none focus:border-walnut"> <option value="">Any</option> <option value="50000"', '>$50k+</option> <option value="80000"', '>$80k+</option> <option value="100000"', '>$100k+</option> <option value="150000"', '>$150k+</option> </select> </div> <!-- Remote --> <label class="flex items-center gap-3 rounded-[8px] bg-white px-4 py-3 text-sm font-semibold text-espresso border border-sand"> <input type="checkbox" name="remote" value="true"', ' class="h-4 w-4 rounded border-sand text-espresso focus:ring-espresso">\nRemote only\n</label> <input type="hidden" name="sort"', '> <input type="hidden" name="view"', '> <div class="pt-4 border-t border-sand flex flex-col gap-3"> <button type="submit" class="bg-espresso text-white hover:bg-walnut w-full justify-center py-3 rounded-[8px] font-bold transition-colors">Apply Filters</button> <a', ' class="text-center text-sm font-semibold text-walnut mt-1 hover:text-espresso">Clear all</a> </div> </div> </form> </aside> <!-- Jobs Area --> <div> <!-- Top controls --> <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"> <!-- Active Pills --> <div class="flex flex-wrap items-center gap-2"> ', " ", ' </div> <!-- Sort Options --> <form action="/jobs" method="GET" class="flex items-center gap-3"> <input type="hidden" name="q"', '> <input type="hidden" name="location"', '> <input type="hidden" name="experience"', '> <input type="hidden" name="source"', '> <input type="hidden" name="employment_type"', '> <input type="hidden" name="remote"', '> <input type="hidden" name="salary_min"', '> <input type="hidden" name="view"', '> <label class="text-sm font-semibold text-espresso hidden sm:block">Sort by</label> <select name="sort" id="sort-select" class="rounded-[8px] border border-sand bg-white px-3 py-2 text-sm font-medium text-espresso outline-none" onchange="this.form.submit()"> <option value="relevance"', '>Relevance</option> <option value="date"', '>Newest</option> <option value="salary"', '>Salary</option> <option value="match"', ">Best match</option> </select> </form> </div> <!-- Live Search Status --> ", ' <!-- Data skeleton & list --> <div id="jobs-container"> ', ' </div> <div id="jobs-loading-skeleton" class="hidden"> <div class="space-y-5"> ', ' </div> </div> </div> </div> </section>  <style>\n        @media (max-width: 1023px) {\n            #filter-form { display: none !important; }\n        }\n    </style> <script>\n        const form = document.getElementById("filter-form");\n        const container = document.getElementById("jobs-container");\n        const skeleton = document.getElementById("jobs-loading-skeleton");\n        const sortSelect = document.getElementById("sort-select");\n\n        if (form) {\n            form.addEventListener("submit", () => {\n                if (container && skeleton) {\n                    container.classList.add("hidden");\n                    skeleton.classList.remove("hidden");\n                }\n            });\n        }\n\n        // Client-side "Best match" sort \u2014 reorder job cards by match score desc\n        if (sortSelect) {\n            sortSelect.addEventListener("change", (e) => {\n                if (e.target.value === "match") {\n                    e.preventDefault();\n                    e.stopPropagation();\n                    const grid = document.getElementById("jobs-grid");\n                    if (!grid) return;\n                    const items = Array.from(grid.children);\n                    items.sort((a, b) => {\n                        const scoreA = parseInt(a.getAttribute("data-match-score") || "0", 10);\n                        const scoreB = parseInt(b.getAttribute("data-match-score") || "0", 10);\n                        return scoreB - scoreA;\n                    });\n                    items.forEach((item) => grid.appendChild(item));\n                    // Update URL without reload\n                    const url = new URL(window.location.href);\n                    url.searchParams.set("sort", "match");\n                    window.history.replaceState({}, "", url.toString());\n                    return false;\n                }\n            });\n        }\n    <\/script> '])), maybeRenderHead(), jobsData.pagination.totalItems, addAttribute(query, "value"), addAttribute(location, "value"), addAttribute(employmentType === "full-time", "selected"), addAttribute(employmentType === "part-time", "selected"), addAttribute(employmentType === "contract", "selected"), addAttribute(employmentType === "internship", "selected"), filtersData.experienceLevels.map((option) => renderTemplate`<option${addAttribute(option, "value")}${addAttribute(option === experience, "selected")}>${option}</option>`), filtersData.sources.map((option) => renderTemplate`<option${addAttribute(option, "value")}${addAttribute(option === source, "selected")}>${option}</option>`), addAttribute(salaryMin === "50000", "selected"), addAttribute(salaryMin === "80000", "selected"), addAttribute(salaryMin === "100000", "selected"), addAttribute(salaryMin === "150000", "selected"), addAttribute(remote === "true", "checked"), addAttribute(sort, "value"), addAttribute(view, "value"), addAttribute(clearAllUrl, "href"), activeFilters.length > 0 && activeFilters.map((filter) => renderTemplate`<a${addAttribute(removeParam(filter.key), "href")} class="tag"> ${filter.label} <svg class="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> </a>`), activeFilters.length > 0 && renderTemplate`<a${addAttribute(clearAllUrl, "href")} class="text-xs font-semibold text-espresso ml-2 underline">Clear All</a>`, addAttribute(query, "value"), addAttribute(location, "value"), addAttribute(experience, "value"), addAttribute(source, "value"), addAttribute(employmentType, "value"), addAttribute(remote, "value"), addAttribute(salaryMin, "value"), addAttribute(view, "value"), addAttribute(sort === "relevance", "selected"), addAttribute(sort === "date", "selected"), addAttribute(sort === "salary", "selected"), addAttribute(sort === "match", "selected"), query && sourceHealth.length > 0 && renderTemplate`<div class="mb-6 rounded-[12px] border border-sand bg-cream-50 px-5 py-4"> <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"> <div> <p class="text-xs font-bold uppercase tracking-widest text-walnut">Sources Status</p> <p class="mt-1 text-sm font-medium text-espresso"> ${healthySources.length > 0 ? `Queried ${healthySources.length} active source${healthySources.length > 1 ? "s" : ""}.` : "No active source returned usable results for this specific role yet."} </p> </div> </div> </div>`, error ? renderTemplate`<div class="rounded-[12px] border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-600"> ${error} </div>` : jobsData.data.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div id="jobs-grid"${addAttribute([view === "grid" ? "grid gap-6 md:grid-cols-2 2xl:grid-cols-3" : "grid gap-5"], "class:list")}> ${jobsData.data.map((job) => renderTemplate`<div${addAttribute(job.matchScore || 0, "data-match-score")}>${renderComponent($$result3, "JobCard", $$JobCard, { "job": job, "mode": view })}</div>`)} </div> <div class="mt-12 flex justify-center"> ${renderComponent($$result3, "Pagination", $$Pagination, { "currentPage": jobsData.pagination.page, "totalPages": jobsData.pagination.totalPages, "baseUrl": url.pathname + url.search })} </div> ` })}` : renderTemplate`<div class="bg-white border border-sand border-left-[3px] border-left-espresso rounded-[16px] p-16 text-center shadow-sm"> <h3 class="text-2xl font-bold text-espresso">No roles found</h3> <p class="mt-4 text-walnut max-w-md mx-auto font-medium">We couldn't find any positions matching your exact criteria. Try removing filters or broadening your search.</p> <div class="mt-8 flex justify-center"> <a${addAttribute(clearAllUrl, "href")} class="bg-espresso text-white py-3 px-8 rounded-[8px] font-semibold hover:bg-walnut transition-colors">Clear all filters</a> </div> </div>`, Array(5).fill(0).map(() => renderTemplate`<div class="bg-white border border-sand rounded-[12px] p-7 flex gap-5 animate-pulse"> <div class="h-14 w-14 rounded-[12px] bg-sand-100 shrink-0"></div> <div class="flex-1 space-y-3 py-1"> <div class="h-4 bg-sand-100 rounded w-1/4"></div> <div class="h-5 bg-sand-100 rounded w-1/2"></div> <div class="h-4 bg-sand-100 rounded w-1/3"></div> </div> </div>`)) })}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/jobs/index.astro", void 0);

const $$file = "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/jobs/index.astro";
const $$url = "/jobs";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
