import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../chunks/astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { h as fetchCompanies, $ as $$PageLayout } from '../chunks/PageLayout_UumKSVf4.mjs';
import { g as getInitials } from '../chunks/job-ui_D_r7-dBy.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const url = Astro2.url;
  const query = url.searchParams.get("q") || "";
  const industry = url.searchParams.get("industry") || "";
  let companies = [];
  let error = null;
  try {
    const response = await fetchCompanies(query);
    companies = response.data;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load companies";
  }
  const industryCounts = /* @__PURE__ */ new Map();
  companies.forEach((company) => {
    industryCounts.set(company.industry, (industryCounts.get(company.industry) || 0) + 1);
  });
  const industries = Array.from(industryCounts.entries()).sort((a, b) => b[1] - a[1]);
  const filteredCompanies = industry ? companies.filter((company) => company.industry === industry) : companies;
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": "Browse Companies", "description": "Explore companies hiring across the JobHuntly experience." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="border-b border-sand bg-off-white"> <div class="mx-auto max-w-[1180px] px-6 py-16"> <h1 class="text-[52px] font-bold tracking-tight text-espresso leading-none">Browse Companies</h1> <form action="/companies" method="GET" class="mt-12 max-w-3xl flex flex-col sm:flex-row p-1.5 bg-white rounded-full border-2 border-sand shadow-[0_4px_24px_rgba(102,73,48,0.12)]"> <input type="search" name="q"${addAttribute(query, "value")} placeholder="Company title or keyword" class="flex-1 rounded-l-full bg-white px-7 py-4 text-base text-espresso outline-none placeholder:text-walnut"> <button type="submit" class="bg-espresso text-white hover:bg-walnut transition-colors px-10 py-4 rounded-full font-semibold text-base">Search</button> </form> </div> </section> <section class="mx-auto max-w-[1180px] px-6 py-16"> <div class="grid gap-10 lg:grid-cols-[18rem_1fr]"> <aside class="bg-white border border-sand rounded-[16px] p-6 shadow-sm h-fit"> <div class="mb-6"> <h2 class="text-[20px] font-bold text-espresso">Industry</h2> <p class="mt-2 text-sm font-medium text-walnut">Choose the company world you want to explore.</p> </div> <div class="space-y-2"> <a${addAttribute(`/companies${query ? `?q=${encodeURIComponent(query)}` : ""}`, "href")}${addAttribute(["block rounded-[8px] px-4 py-3 text-sm font-semibold transition-colors", industry === "" ? "bg-cream text-espresso" : "text-walnut hover:bg-off-white hover:text-espresso"], "class:list")}>
All industries
</a> ${industries.slice(0, 10).map(([label, count]) => renderTemplate`<a${addAttribute(`/companies?${new URLSearchParams({ q: query, industry: label }).toString()}`, "href")}${addAttribute(["block rounded-[8px] px-4 py-3 text-sm font-semibold transition-colors", industry === label ? "bg-cream text-espresso" : "text-walnut hover:bg-off-white hover:text-espresso"], "class:list")}> ${label} (${count})
</a>`)} </div> </aside> <div> <div class="mb-10"> <h2 class="text-[28px] font-bold text-espresso">All Companies</h2> <p class="mt-2 text-[18px] font-medium text-walnut">Showing ${filteredCompanies.length} results</p> </div> ${error ? renderTemplate`<div class="rounded-[12px] border border-sand bg-off-white p-6 text-base font-bold text-walnut"> ${error} </div>` : renderTemplate`<div class="grid gap-8 md:grid-cols-2"> ${filteredCompanies.map((company) => renderTemplate`<a${addAttribute(`/companies/${company.slug}`, "href")} class="bg-white border border-sand border-left-[3px] border-left-espresso rounded-[12px] p-7 shadow-[0_2px_8px_rgba(102,73,48,0.08)] hover:shadow-[0_6px_20px_rgba(102,73,48,0.15)] hover:-translate-y-0.5 transition-all group"> <div class="flex items-center justify-between gap-4"> <div class="flex h-16 w-16 items-center justify-center rounded-[12px] bg-cream text-2xl font-bold tracking-tight text-espresso transition-transform group-hover:scale-105"> ${getInitials(company.name)} </div> <span class="rounded-[8px] bg-off-white border border-sand px-4 py-2 text-sm font-semibold text-espresso">${company.jobCount} Jobs</span> </div> <h3 class="mt-6 text-[22px] font-bold text-espresso group-hover:text-walnut transition-colors">${company.name}</h3> <p class="mt-3 text-sm font-medium leading-relaxed text-walnut">${company.description}</p> <div class="mt-6 flex flex-wrap gap-2"> <span class="bg-sand-100 text-walnut px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider">${company.industry}</span> <span class="bg-cream text-espresso px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider">${company.jobCount} open roles</span> </div> </a>`)} </div>`} </div> </div> </section> ` })}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/companies/index.astro", void 0);

const $$file = "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/companies/index.astro";
const $$url = "/companies";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
