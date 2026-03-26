import { e as createComponent, g as addAttribute, p as renderHead, n as renderSlot, r as renderTemplate, h as createAstro, m as maybeRenderHead } from './astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$Astro$1 = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title,
    description = "JobHuntly helps people discover standout roles, explore companies, and manage their next move with confidence."
  } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"${addAttribute(description, "content")}><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><title>${title} | JobHuntly</title>${renderHead()}</head> <body class="min-h-screen bg-[var(--jp-bg)] text-[var(--jp-text-primary)] antialiased"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/layouts/BaseLayout.astro", void 0);

const $$Astro = createAstro();
const $$BrandMark = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BrandMark;
  const { href = "/", light = false } = Astro2.props;
  const textClass = light ? "text-cream" : "text-espresso";
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")} class="inline-flex items-center gap-3 group"> <span class="relative flex h-10 w-10 items-center justify-center rounded-[12px] bg-espresso shadow-md transition-transform group-hover:scale-105"> <span class="absolute h-4 w-4 rounded-full border-[3px] border-cream"></span> <span class="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cream"></span> </span> <span${addAttribute(["text-xl font-bold tracking-tight", textClass], "class:list")}>
JobPulse
</span> </a>`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/common/BrandMark.astro", void 0);

export { $$BaseLayout as $, $$BrandMark as a };
