import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute, l as Fragment } from '../../chunks/astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { i as fetchJob, g as fetchCompany, $ as $$PageLayout } from '../../chunks/PageLayout_UumKSVf4.mjs';
import { S as SaveJobButton, $ as $$JobCard } from '../../chunks/JobCard_CDhFlij3.mjs';
import { f as formatSalaryRange, g as getInitials, s as sourceLabel, a as formatAbsoluteDate } from '../../chunks/job-ui_D_r7-dBy.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  let job = null;
  let similarJobs = [];
  let company = null;
  let error = null;
  try {
    if (id) {
      job = await fetchJob(id);
      if (job?.companySlug) {
        const companyResponse = await fetchCompany(job.companySlug);
        company = companyResponse.company;
        similarJobs = companyResponse.jobs.filter((item) => item.id !== job.id).slice(0, 4);
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load job";
  }
  const salary = job ? formatSalaryRange(job) : null;
  const descriptionSections = job ? job.description.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean).map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const bulletLines = lines.filter((line) => /^[-*•]/.test(line)).map((line) => line.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
    if (bulletLines.length >= 2 && bulletLines.length === lines.length) {
      return { kind: "list", items: bulletLines };
    }
    return { kind: "paragraph", text: lines.join(" ") };
  }) : [];
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": job ? `${job.title} at ${job.company}` : "Job Not Found", "description": job ? job.description : "Job detail page" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="border-b border-sand bg-off-white"> <div class="mx-auto max-w-[1180px] px-6 py-16"> <a href="/jobs" class="text-xs font-bold uppercase tracking-widest text-espresso hover:text-walnut transition-colors">← Back to jobs</a> ${job && renderTemplate`<div class="bg-white border border-sand border-left-[4px] border-left-espresso mt-10 flex flex-col gap-8 p-10 lg:flex-row lg:items-center lg:justify-between rounded-[16px] shadow-lg"> <div class="flex min-w-0 items-start gap-6"> <div class="flex h-20 w-20 items-center justify-center rounded-[16px] bg-cream text-[32px] font-bold text-espresso shrink-0"> ${getInitials(job.company)} </div> <div class="min-w-0"> <h1 class="break-words text-[42px] font-bold leading-none tracking-tight text-espresso">${job.title}</h1> <div class="mt-4 break-words text-[20px] font-medium text-walnut">${job.company} • ${job.location} • ${job.employmentType}</div> <div class="mt-5 flex flex-wrap gap-2"> <span class="tag">${job.skills[0] || job.experienceLevel}</span> <span class="tag">${sourceLabel(job.source)}</span> </div> </div> </div> <div class="flex shrink-0 flex-wrap items-center gap-3"> ${renderComponent($$result2, "SaveJobButton", SaveJobButton, { "client:load": true, "jobId": job.id, "initialSaved": job.isSaved, "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/SaveJobButton", "client:component-export": "default" })} <a${addAttribute(job.sourceUrl, "href")} target="_blank" rel="noreferrer" class="jh-button px-8 py-4">Apply</a> </div> </div>`} </div> </section> <section class="mx-auto max-w-[1180px] px-6 py-14"> ${error ? renderTemplate`<div class="rounded-[1.5rem] border border-[rgba(255,108,95,0.28)] bg-[rgba(255,108,95,0.08)] p-6 text-lg font-medium text-[var(--jh-coral)]"> ${error} </div>` : job && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="space-y-8 min-w-0"> <div class="bg-white border border-sand rounded-[16px] p-10 shadow-sm"> <h2 class="text-[28px] font-bold text-espresso">Description</h2> <div class="mt-8 space-y-6"> ${descriptionSections.map((section) => section.kind === "list" ? renderTemplate`<ul class="space-y-4 text-base leading-relaxed text-espresso"> ${section.items.map((item) => renderTemplate`<li class="flex gap-4"> <span class="mt-2.5 inline-block h-2 w-2 shrink-0 rounded-full bg-walnut opacity-60"></span> <span>${item}</span> </li>`)} </ul>` : renderTemplate`<p class="max-w-[72ch] text-[16px] leading-relaxed text-espresso font-medium">${section.text}</p>`)} ${descriptionSections.length === 0 && renderTemplate`<p class="max-w-[72ch] text-[16px] leading-relaxed text-espresso font-medium">${job.description}</p>`} </div> </div> </div> <aside class="space-y-6 lg:sticky lg:top-32 lg:self-start"> <div class="bg-white border border-sand rounded-[16px] p-8 shadow-sm"> <h2 class="text-[20px] font-bold text-espresso">About this role</h2> <div class="mt-6 space-y-5 text-sm sm:text-base"> <div class="flex items-center justify-between gap-4 border-b border-sand pb-4"> <span class="text-walnut font-medium">Apply before</span> <span class="font-bold text-espresso">${job.expiresAt ? formatAbsoluteDate(job.expiresAt) : "Open now"}</span> </div> <div class="flex items-center justify-between gap-4 border-b border-sand pb-4"> <span class="text-walnut font-medium">Job posted on</span> <span class="font-bold text-espresso">${formatAbsoluteDate(job.postedAt)}</span> </div> <div class="flex items-center justify-between gap-4 border-b border-sand pb-4"> <span class="text-walnut font-medium">Job type</span> <span class="font-bold text-espresso">${job.employmentType}</span> </div> <div class="flex items-center justify-between gap-4 border-b border-sand pb-4"> <span class="text-walnut font-medium">Salary</span> <span class="font-bold text-espresso">${salary || "Competitive"}</span> </div> <div class="flex items-center justify-between gap-4"> <span class="text-walnut font-medium">Source</span> <span class="font-bold text-espresso">${sourceLabel(job.source)}</span> </div> </div> </div> <div class="bg-white border border-sand rounded-[16px] p-8 shadow-sm"> <h2 class="text-[20px] font-bold text-espresso">Required skills</h2> <div class="mt-6 flex flex-wrap gap-2"> ${job.skills.length > 0 ? job.skills.map((skill) => renderTemplate`<span class="tag"${addAttribute(skill, "title")}>${skill}</span>`) : renderTemplate`<span class="text-sm font-medium text-walnut">No skill tags provided for this listing.</span>`} </div> </div> ${company && renderTemplate`<div class="bg-white border border-sand rounded-[16px] p-8 shadow-sm"> <div class="flex items-center gap-4"> <div class="flex h-14 w-14 items-center justify-center rounded-[12px] bg-cream text-xl font-bold text-espresso"> ${getInitials(company.name)} </div> <div class="min-w-0"> <div class="text-[18px] font-bold text-espresso truncate">${company.name}</div> <a${addAttribute(`/companies/${company.slug}`, "href")} class="text-sm font-bold text-walnut hover:text-espresso transition-colors">Company profile →</a> </div> </div> <p class="mt-5 text-sm font-medium leading-relaxed text-walnut">${company.description}</p> </div>`} </aside> ${similarJobs.length > 0 && renderTemplate`<div class="mt-20"> <div class="mb-10 flex items-end justify-between gap-4"> <h2 class="text-[32px] font-bold tracking-tight text-espresso">Similar Jobs</h2> <a href="/jobs" class="text-base font-bold text-walnut hover:text-espresso transition-colors">Show all jobs →</a> </div> <div class="grid gap-8 lg:grid-cols-2"> ${similarJobs.map((item) => renderTemplate`${renderComponent($$result3, "JobCard", $$JobCard, { "job": item, "mode": "list" })}`)} </div> </div>`}` })}`} </section> ` })}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/jobs/[id].astro", void 0);

const $$file = "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/jobs/[id].astro";
const $$url = "/jobs/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$id,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
