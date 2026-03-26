import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { g as fetchCompany, $ as $$PageLayout } from '../../chunks/PageLayout_UumKSVf4.mjs';
import { $ as $$JobCard } from '../../chunks/JobCard_CDhFlij3.mjs';
import { g as getInitials } from '../../chunks/job-ui_D_r7-dBy.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  let company = null;
  let jobs = [];
  let error = null;
  try {
    if (slug) {
      const response = await fetchCompany(slug);
      company = response.company;
      jobs = response.jobs;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load company";
  }
  const benefitItems = [
    { title: "Full Healthcare", copy: "We believe in thriving communities and that starts with our team being happy and healthy." },
    { title: "Unlimited Vacation", copy: "Flexible time away that makes space for family, wellness, and fun." },
    { title: "Skill Development", copy: "We invest in learning, growth, and practical experience." },
    { title: "Remote Working", copy: "Work where you do your best thinking and collaboration." }
  ];
  const focusAreas = Array.from(new Set(jobs.flatMap((job) => job.skills))).slice(0, 6);
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": company ? company.name : "Company Not Found", "description": company ? company.description : "Company detail page" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="border-b border-sand bg-off-white"> <div class="mx-auto max-w-[1180px] px-6 py-16"> <a href="/companies" class="text-xs font-bold uppercase tracking-widest text-espresso hover:text-walnut transition-colors">← Back to companies</a> ${company && renderTemplate`<div class="mt-10 grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center bg-white border border-sand border-left-[4px] border-left-espresso p-10 rounded-[16px] shadow-lg"> <div class="flex h-32 w-32 items-center justify-center rounded-[20px] bg-cream text-[48px] font-bold text-espresso shrink-0"> ${getInitials(company.name)} </div> <div class="min-w-0"> <div class="flex flex-wrap items-center gap-4"> <h1 class="text-[48px] font-bold tracking-tight text-espresso leading-none">${company.name}</h1> <span class="rounded-[8px] bg-off-white border border-sand px-4 py-2 text-sm font-semibold text-espresso">${company.jobCount} Jobs</span> </div> <a${addAttribute(company.website, "href")} target="_blank" rel="noreferrer" class="mt-4 inline-block text-[18px] font-bold text-walnut hover:text-espresso transition-colors">${company.website}</a> <div class="mt-6 flex flex-wrap gap-2 text-lg text-slate-600"> <span class="tag">${company.industry}</span> <span class="tag">${company.jobCount} active roles</span> </div> </div> </div>`} </div> </section> <section class="mx-auto max-w-[1180px] px-6 py-14"> ${error ? renderTemplate`<div class="rounded-[1.5rem] border border-[rgba(255,108,95,0.28)] bg-[rgba(255,108,95,0.08)] p-6 text-lg font-medium text-[var(--jh-coral)]"> ${error} </div>` : company && renderTemplate`<div class="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]"> <div class="space-y-12"> <div class="bg-white border border-sand rounded-[16px] p-10 shadow-sm"> <h2 class="text-[28px] font-bold text-espresso">Company Profile</h2> <p class="mt-6 text-[18px] leading-relaxed text-espresso font-medium">${company.description}</p> </div> <div class="bg-white border border-sand rounded-[16px] p-10 shadow-sm"> <h2 class="text-[24px] font-bold text-espresso">Benefits</h2> <div class="mt-8 grid gap-6 sm:grid-cols-2"> ${benefitItems.map((benefit) => renderTemplate`<div class="rounded-[12px] border border-sand p-6 bg-off-white"> <div class="text-[18px] font-bold text-espresso">${benefit.title}</div> <p class="mt-3 text-sm leading-relaxed font-medium text-walnut">${benefit.copy}</p> </div>`)} </div> </div> <div> <div class="mb-6 flex items-end justify-between gap-4"> <h2 class="text-[2.3rem] font-extrabold tracking-[-0.06em] text-slate-900">Open Jobs</h2> <a href="/jobs" class="text-lg font-semibold text-[var(--jh-primary)]">Show all jobs →</a> </div> <div class="space-y-5"> ${jobs.map((job) => renderTemplate`${renderComponent($$result2, "JobCard", $$JobCard, { "job": job, "mode": "list" })}`)} </div> </div> </div> <div class="space-y-8"> <div class="bg-white border border-sand rounded-[16px] p-8 shadow-sm"> <h2 class="text-[20px] font-bold text-espresso">Tech stack</h2> <div class="mt-6 flex flex-wrap gap-2"> ${focusAreas.length > 0 ? focusAreas.map((item) => renderTemplate`<span class="tag">${item}</span>`) : renderTemplate`<span class="text-sm font-medium text-walnut">Focus areas will appear here as jobs gain richer skill data.</span>`} </div> </div> <div class="bg-white border border-sand rounded-[16px] p-8 shadow-sm"> <h2 class="text-[20px] font-bold text-espresso">Contact</h2> <div class="mt-6 space-y-4"> <a${addAttribute(company.website, "href")} target="_blank" rel="noreferrer" class="block rounded-[8px] bg-espresso text-white px-5 py-4 text-center font-bold hover:bg-walnut transition-colors">
Visit Website
</a> <div class="rounded-[8px] bg-cream p-5 text-sm font-bold text-espresso text-center">
Currently hiring for ${company.jobCount} role${company.jobCount === 1 ? "" : "s"}.
</div> </div> </div> <div class="jh-card overflow-hidden"> <div class="grid grid-cols-2 gap-2 p-2"> <div class="h-52 rounded-[1.3rem] bg-[linear-gradient(135deg,#f1ddcf_0%,#dcb89d_100%)]"></div> <div class="grid gap-2"> <div class="h-[9.75rem] rounded-[1.3rem] bg-[linear-gradient(135deg,#f6f8ff_0%,#dbe2ff_100%)]"></div> <div class="h-[9.75rem] rounded-[1.3rem] bg-[linear-gradient(135deg,#e2f8f4_0%,#bef0e5_100%)]"></div> </div> </div> </div> </div> </div>`} </section> ` })}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/companies/[slug].astro", void 0);

const $$file = "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/companies/[slug].astro";
const $$url = "/companies/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$slug,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
