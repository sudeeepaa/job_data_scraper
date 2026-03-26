import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { $ as $$PageLayout } from '../chunks/PageLayout_UumKSVf4.mjs';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Profile = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": "Your Profile | JobPulse", "description": "Manage your JobPulse account and saved jobs." }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", ' <script>\n        // Redirect before rendering if no token exists\n        if (!localStorage.getItem("token")) {\n            window.location.href = "/auth/login";\n        }\n    <\/script> '])), renderComponent($$result2, "ProfileView", null, { "client:only": "preact", "client:component-hydration": "only", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/ProfileView", "client:component-export": "default" })) })}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/profile.astro", void 0);

const $$file = "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/profile.astro";
const $$url = "/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Profile,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
