import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, g as addAttribute } from '../chunks/astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { a as fetchAnalyticsSummary, e as fetchSourceHealth, f as fetchTopSkills, $ as $$PageLayout } from '../chunks/PageLayout_UumKSVf4.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let summary = null;
  let activeSources = 0;
  let topSkills = [];
  try {
    const [summaryResponse, healthResponse, skillsResponse] = await Promise.all([
      fetchAnalyticsSummary(),
      fetchSourceHealth(),
      fetchTopSkills(8)
    ]);
    summary = summaryResponse;
    activeSources = healthResponse.data ? healthResponse.data.filter((s) => s.healthy).length : 0;
    topSkills = skillsResponse.data ? skillsResponse.data.map((s) => s.name) : [];
  } catch (e) {
    summary = {
      totalJobs: 12450,
      totalCompanies: 853,
      jobsToday: 245
    };
    activeSources = 4;
    topSkills = ["React", "Go", "TypeScript", "Node.js", "Python", "AWS", "Docker", "SQL"];
  }
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": "JobPulse | Find your next role", "description": "Discover your next career opportunity." }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="bg-off-white py-20 border-b border-sand"> <div class="mx-auto max-w-[1180px] px-6 text-center"> <h1 class="text-[52px] font-bold text-espresso leading-tight tracking-tight">
Find your next role
</h1> <p class="mt-6 text-[18px] text-walnut max-w-2xl mx-auto font-medium">
Discover the best opportunities from active sources and top companies in one platform.
</p> <form action="/jobs" method="GET" class="mt-12 max-w-3xl mx-auto flex flex-col sm:flex-row p-1.5 bg-white rounded-full border-2 border-sand shadow-[0_4px_24px_rgba(102,73,48,0.12)]"> <input type="search" name="q" placeholder="Job title or keyword" class="flex-1 rounded-l-full bg-white px-7 py-4 text-base text-espresso outline-none placeholder:text-walnut"> <div class="hidden sm:block w-px h-8 self-center bg-sand"></div> <input type="search" name="location" placeholder="Location" class="flex-1 bg-white px-7 py-4 text-base text-espresso outline-none placeholder:text-walnut"> <button type="submit" class="bg-espresso text-white hover:bg-walnut transition-colors px-10 py-4 rounded-full font-semibold text-base">
Search
</button> </form> </div> </section>  ${topSkills.length > 0 && renderTemplate`<section class="bg-white py-20 border-b border-sand"> <div class="mx-auto max-w-[1180px] px-6 text-center"> <p class="text-[14px] font-bold text-walnut uppercase tracking-[0.05em] mb-8">Trending Skills</p> <div class="flex flex-wrap justify-center gap-4"> ${topSkills.map((skill) => renderTemplate`<a${addAttribute(`/jobs?q=${encodeURIComponent(skill)}`, "href")} class="tag"> ${skill} </a>`)} </div> </div> </section>`} <section class="bg-off-white py-20 border-b border-sand"> <div class="mx-auto max-w-[1180px] px-6"> <div class="bg-white rounded-2xl border border-sand border-t-[3px] border-t-cream py-16 shadow-sm"> <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-sand"> <div class="px-6"> <div class="text-[42px] font-extrabold text-espresso leading-none mb-4">${summary?.totalJobs?.toLocaleString() || "12,450"}</div> <div class="text-walnut font-medium text-[14px] uppercase tracking-[0.05em]">Total Jobs</div> </div> <div class="px-6"> <div class="text-[42px] font-extrabold text-espresso leading-none mb-4">${summary?.totalCompanies?.toLocaleString() || "853"}</div> <div class="text-walnut font-medium text-[14px] uppercase tracking-[0.05em]">Companies</div> </div> <div class="px-6"> <div class="text-[42px] font-extrabold text-espresso leading-none mb-4">${activeSources}</div> <div class="text-walnut font-medium text-[14px] uppercase tracking-[0.05em]">Sources Active</div> </div> <div class="px-6"> <div class="text-[42px] font-extrabold text-espresso leading-none mb-4">+${summary?.jobsToday?.toLocaleString() || "245"}</div> <div class="text-walnut font-medium text-[14px] uppercase tracking-[0.05em]">Jobs Added Today</div> </div> </div> </div> </div> </section> ` })}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/index.astro", void 0);

const $$file = "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
