import { e as createComponent, k as renderComponent, r as renderTemplate } from '../../chunks/astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { $ as $$AuthLayout } from '../../chunks/AuthLayout_DZ4QrndK.mjs';
import { useState } from 'preact/hooks';
import { jsxs, jsx } from 'preact/jsx-runtime';
import { T as ToastNotification } from '../../chunks/ToastNotification_g7H78A2Z.mjs';
export { renderers } from '../../renderers.mjs';

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const validate = () => {
    const errors = {};
    if (!email) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Valid email is required";
    if (!password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      if (!res.ok) {
        const data2 = await res.json().catch(() => ({}));
        throw new Error(data2.message || "Invalid credentials");
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/";
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return jsxs("form", {
    onSubmit: handleSubmit,
    class: "w-full space-y-6",
    children: [error && jsx("div", {
      class: "rounded-[8px] border-2 border-sand bg-off-white p-4 text-center",
      children: jsx("p", {
        class: "text-sm font-bold text-espresso",
        children: error
      })
    }), jsxs("div", {
      class: "relative pt-2",
      children: [jsx("input", {
        id: "email",
        type: "email",
        value: email,
        onInput: (e) => setEmail(e.target.value),
        onFocus: () => setFocusedField("email"),
        onBlur: () => setFocusedField(null),
        required: true,
        class: `peer w-full rounded-[8px] bg-white px-4 pb-3 pt-6 text-espresso text-md font-medium outline-none transition-all focus:ring-2 focus:ring-espresso ${fieldErrors.email ? "border-2 border-sand ring-1 ring-sand" : "border border-sand"}`
      }), jsx("label", {
        for: "email",
        class: `pointer-events-none absolute left-4 transition-all text-walnut font-bold ${focusedField === "email" || email ? "top-4 text-xs" : "top-6 text-sm"}`,
        children: "Email Address"
      }), fieldErrors.email && jsx("p", {
        class: "mt-1 text-xs font-bold text-walnut",
        children: fieldErrors.email
      })]
    }), jsxs("div", {
      class: "relative pt-2",
      children: [jsx("input", {
        id: "password",
        type: showPassword ? "text" : "password",
        value: password,
        onInput: (e) => setPassword(e.target.value),
        onFocus: () => setFocusedField("password"),
        onBlur: () => setFocusedField(null),
        required: true,
        class: `peer w-full rounded-[8px] bg-white px-4 pb-3 pt-6 pr-12 text-espresso text-md font-medium outline-none transition-all focus:ring-2 focus:ring-espresso ${fieldErrors.password ? "border-2 border-sand ring-1 ring-sand" : "border border-sand"}`
      }), jsx("label", {
        for: "password",
        class: `pointer-events-none absolute left-4 transition-all text-walnut font-bold ${focusedField === "password" || password ? "top-4 text-xs" : "top-6 text-sm"}`,
        children: "Password"
      }), jsx("button", {
        type: "button",
        tabIndex: -1,
        onClick: () => setShowPassword(!showPassword),
        class: "absolute bottom-3 right-4 text-walnut hover:text-espresso",
        children: showPassword ? "Hide" : "Show"
      }), fieldErrors.password && jsx("p", {
        class: "mt-1 text-xs font-bold text-walnut",
        children: fieldErrors.password
      })]
    }), jsx("button", {
      type: "submit",
      disabled: loading,
      class: "flex w-full items-center justify-center rounded-[8px] bg-espresso py-4 text-md font-extrabold text-cream hover:bg-walnut transition-colors disabled:opacity-70",
      children: loading ? jsxs("svg", {
        class: "h-6 w-6 animate-spin text-cream",
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
      }) : "Sign in"
    }), jsxs("p", {
      class: "text-center text-sm font-semibold text-walnut mt-6",
      children: ["Don't have an account?", " ", jsx("a", {
        href: "/auth/register",
        class: "text-espresso hover:underline",
        children: "Register"
      })]
    })]
  });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AuthLayout", $$AuthLayout, { "title": "Welcome back | JobPulse", "headline": "Welcome back", "subheadline": "Please enter your details to sign in." }, { "default": ($$result2) => renderTemplate(_a || (_a = __template([" ", " ", ' <script>\n        // If already logged in, redirect to home\n        if (localStorage.getItem("token")) {\n            window.location.href = "/";\n        }\n    <\/script> '])), renderComponent($$result2, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/LoginForm", "client:component-export": "default" }), renderComponent($$result2, "ToastNotification", ToastNotification, { "client:load": true, "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/ToastNotification", "client:component-export": "default" })) })}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/auth/login.astro", void 0);

const $$file = "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/auth/login.astro";
const $$url = "/auth/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Login,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
