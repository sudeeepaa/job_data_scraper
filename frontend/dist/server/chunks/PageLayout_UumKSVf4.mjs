import { e as createComponent, m as maybeRenderHead, k as renderComponent, g as addAttribute, r as renderTemplate, o as renderScript, h as createAstro, n as renderSlot } from './astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { a as $$BrandMark, $ as $$BaseLayout } from './BrandMark_Crfpi4uP.mjs';
import { useState, useEffect } from 'preact/hooks';
import { jsxs, jsx } from 'preact/jsx-runtime';

const serverAPIBase = "http://127.0.0.1:8080";
const API_BASE = serverAPIBase ;
async function fetchAPI(endpoint, options) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...{} ,
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  });
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      if (data?.error) {
        detail = data.error;
      }
    } catch {
    }
    throw new Error(detail);
  }
  return response.json();
}
async function fetchJobs(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== void 0 && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return fetchAPI(`/api/v1/jobs${query ? `?${query}` : ""}`);
}
async function fetchJob(id) {
  return fetchAPI(`/api/v1/jobs/${id}`);
}
async function fetchFilters() {
  return fetchAPI("/api/v1/filters");
}
async function fetchCompanies(query) {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  return fetchAPI(`/api/v1/companies${params}`);
}
async function fetchCompany(slug) {
  return fetchAPI(`/api/v1/companies/${slug}`);
}
async function fetchTopSkills(limit = 20) {
  return fetchAPI(`/api/v1/analytics/skills?limit=${limit}`);
}
async function fetchAnalyticsSummary() {
  return fetchAPI("/api/v1/analytics/summary");
}
async function fetchMarketTrends(limit = 10) {
  return fetchAPI(`/api/v1/analytics/trends?limit=${limit}`);
}
async function fetchSourceDistribution() {
  return fetchAPI("/api/v1/analytics/sources");
}
async function fetchSourceHealth() {
  return fetchAPI("/api/v1/analytics/source-health");
}
async function fetchSalaryStats() {
  return fetchAPI("/api/v1/analytics/salary");
}
async function logout() {
  return fetchAPI("/api/v1/auth/logout", {
    method: "POST"
  });
}
async function fetchSession() {
  return fetchAPI("/api/v1/auth/session");
}
async function saveJob(jobId) {
  return fetchAPI(`/api/v1/me/saved-jobs/${jobId}`, {
    method: "POST"
  });
}
async function unsaveJob(jobId) {
  return fetchAPI(`/api/v1/me/saved-jobs/${jobId}`, {
    method: "DELETE"
  });
}

function AuthNav() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    fetchSession().then((session) => {
      setLoggedIn(!!session.authenticated);
    }).catch(() => {
      setLoggedIn(false);
    });
  }, []);
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = "/";
    }
  };
  if (loggedIn) {
    return jsxs("div", {
      class: "flex items-center gap-3",
      children: [jsxs("a", {
        href: "/auth/profile",
        class: "inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-base font-semibold tracking-[-0.03em] text-slate-700 hover:bg-[var(--jh-soft)] hover:text-[var(--jh-primary)]",
        children: [jsx("svg", {
          class: "w-4 h-4",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: jsx("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          })
        }), "Profile"]
      }), jsx("button", {
        type: "button",
        onClick: handleLogout,
        class: "inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-base font-semibold tracking-[-0.03em] text-slate-500 hover:bg-[var(--jh-soft)] hover:text-[var(--jh-coral)]",
        children: "Logout"
      })]
    });
  }
  return jsxs("div", {
    class: "flex items-center gap-3",
    children: [jsx("a", {
      href: "/auth/login",
      class: "px-4 py-2 text-sm font-semibold text-walnut hover:text-espresso hover:underline transition-all",
      children: "Login"
    }), jsx("a", {
      href: "/auth/register",
      class: "bg-espresso text-cream hover:bg-walnut px-5 py-2 rounded-[8px] font-semibold text-sm transition-all",
      children: "Sign Up"
    })]
  });
}

const $$Astro$1 = createAstro();
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Header;
  const navLinks = [
    { href: "/jobs", label: "Jobs" },
    { href: "/companies", label: "Companies" },
    { href: "/analytics", label: "Analytics" }
  ];
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-50 border-b border-sand bg-white shadow-[0_1px_0_#CCBEB1]"> <nav class="mx-auto flex h-24 max-w-[1180px] items-center justify-between px-6"> ${renderComponent($$result, "BrandMark", $$BrandMark, {})} <div class="hidden items-center gap-10 lg:flex"> ${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute([
    "border-b-[3px] pb-4 text-lg font-semibold tracking-[-0.03em] transition-colors",
    currentPath === link.href || link.href !== "/" && currentPath.startsWith(link.href) ? "border-espresso text-espresso" : "border-transparent text-walnut hover:text-espresso"
  ], "class:list")}> ${link.label} </a>`)} </div> <div class="hidden items-center gap-5 lg:flex"> ${renderComponent($$result, "AuthNav", AuthNav, { "client:load": true, "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/AuthNav", "client:component-export": "default" })} </div> <button type="button" class="rounded-2xl border border-sand p-3 text-walnut lg:hidden" aria-label="Open menu" id="mobile-menu-btn"> <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16"></path> </svg> </button> </nav> <div class="hidden border-t border-sand bg-white lg:hidden" id="mobile-menu"> <div class="mx-auto flex max-w-[1180px] flex-col gap-5 px-6 py-6"> ${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute([
    "text-lg font-semibold tracking-[-0.03em]",
    currentPath === link.href || link.href !== "/" && currentPath.startsWith(link.href) ? "text-espresso" : "text-walnut"
  ], "class:list")}> ${link.label} </a>`)} <div class="flex items-center gap-4"> ${renderComponent($$result, "AuthNav", AuthNav, { "client:load": true, "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/AuthNav", "client:component-export": "default" })} </div> </div> </div> </header> ${renderScript($$result, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/common/Header.astro?astro&type=script&index=0&lang.ts")}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/common/Header.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer class="border-t border-sand bg-off-white"> <div class="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-6 px-6 py-16 md:flex-row"> <div class="flex flex-col items-center gap-4 md:items-start"> ${renderComponent($$result, "BrandMark", $$BrandMark, {})} <p class="text-[14px] font-medium text-walnut">
Powered by JSearch & Adzuna
</p> </div> <div class="flex flex-wrap justify-center gap-8 text-[14px] font-semibold text-walnut"> <a href="/jobs" class="hover:text-espresso transition-colors">Jobs</a> <a href="/companies" class="hover:text-espresso transition-colors">Companies</a> <a href="/analytics" class="hover:text-espresso transition-colors">Analytics</a> <a href="/auth/login" class="hover:text-espresso transition-colors">Login</a> </div> </div> <div class="mx-auto max-w-[1180px] border-t border-sand px-6 py-8 text-center text-[13px] font-medium text-walnut"> <p>&copy; ${currentYear} JobPulse. All rights reserved.</p> </div> </footer>`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/common/Footer.astro", void 0);

const $$Astro = createAstro();
const $$PageLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PageLayout;
  const { title, description } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex min-h-screen flex-col"> ${renderComponent($$result2, "Header", $$Header, {})} <main class="flex-1"> ${renderSlot($$result2, $$slots["default"])} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> ` })}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/layouts/PageLayout.astro", void 0);

export { $$PageLayout as $, fetchAnalyticsSummary as a, fetchMarketTrends as b, fetchSourceDistribution as c, fetchSalaryStats as d, fetchSourceHealth as e, fetchTopSkills as f, fetchCompany as g, fetchCompanies as h, fetchJob as i, fetchJobs as j, fetchFilters as k, saveJob as s, unsaveJob as u };
