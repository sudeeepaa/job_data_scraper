import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, n as renderSlot } from './astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { $ as $$BaseLayout, a as $$BrandMark } from './BrandMark_Crfpi4uP.mjs';

const $$Astro = createAstro();
const $$AuthLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AuthLayout;
  const { title, description, headline, subheadline } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)]"> <section class="relative hidden overflow-hidden bg-cream lg:flex"> <div class="relative flex w-full flex-col px-14 py-12"> ${renderComponent($$result2, "BrandMark", $$BrandMark, {})} <div class="mt-12 max-w-[30rem]"> <div class="bg-white border-2 border-sand rounded-[16px] mb-8 inline-flex w-fit flex-col gap-2 px-6 py-5 shadow-sm"> <div class="flex gap-2"> <span class="h-7 w-2 rounded-full bg-espresso"></span> <span class="h-5 w-2 rounded-full bg-walnut"></span> </div> <div class="text-4xl font-bold tracking-tight text-espresso">100K+</div> <div class="text-lg font-medium text-walnut">People got hired</div> </div> <!-- Simplified Visual for High Contrast --> <div class="relative rounded-[2.4rem] bg-white border border-sand p-10 shadow-lg"> <div class="mx-auto aspect-[4/5] max-w-[22rem] rounded-[2rem] bg-off-white border border-sand"></div> <div class="absolute bottom-8 left-8 max-w-[19rem] rounded-[2rem] bg-white border-2 border-sand p-6 shadow-md"> <div class="mb-3 flex items-center gap-4"> <div class="flex h-16 w-16 items-center justify-center rounded-full bg-espresso text-xl font-bold text-white">A</div> <div> <div class="text-2xl font-bold tracking-tight text-espresso">Adam Sandler</div> <div class="text-base font-medium text-walnut">Lead Engineer at Canva</div> </div> </div> <p class="text-xl font-semibold leading-relaxed tracking-tight text-espresso">
“Great platform for the job seeker that searching for new career heights.”
</p> </div> </div> </div> </div> </section> <section class="flex items-center justify-center bg-off-white px-6 py-12 sm:px-10"> <div class="w-full max-w-[28rem]"> <div class="mb-10 flex justify-center lg:hidden"> ${renderComponent($$result2, "BrandMark", $$BrandMark, {})} </div> <div class="mb-10"> <h1 class="mb-4 text-5xl font-bold tracking-tight text-espresso">${headline}</h1> <p class="text-lg font-medium leading-relaxed text-walnut">${subheadline}</p> </div> ${renderSlot($$result2, $$slots["default"])} </div> </section> </main> ` })}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/layouts/AuthLayout.astro", void 0);

export { $$AuthLayout as $ };
