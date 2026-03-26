import { useState, useEffect } from 'preact/hooks';
import { jsx, jsxs } from 'preact/jsx-runtime';

const showToast = (message, type = "info") => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("show-toast", {
      detail: {
        message,
        type
      }
    }));
  }
};
function ToastNotification() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handleToast = (e) => {
      const customEvent = e;
      const newToast = {
        ...customEvent.detail,
        id: Date.now()
      };
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3e3);
    };
    window.addEventListener("show-toast", handleToast);
    return () => window.removeEventListener("show-toast", handleToast);
  }, []);
  if (toasts.length === 0) return null;
  return jsx("div", {
    class: "fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none",
    children: toasts.map((toast) => jsxs("div", {
      class: "animate-fade-in-up flex items-center gap-3 rounded-[8px] border-2 border-sand bg-cream px-5 py-3 text-espresso shadow-lg pointer-events-auto",
      children: [toast.type === "success" && jsx("svg", {
        class: "h-5 w-5 text-espresso",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: jsx("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M5 13l4 4L19 7"
        })
      }), toast.type === "error" && jsx("svg", {
        class: "h-5 w-5 text-red-600",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: jsx("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": "2",
          d: "M6 18L18 6M6 6l12 12"
        })
      }), jsx("span", {
        class: "font-bold text-sm tracking-wide",
        children: toast.message
      })]
    }, toast.id))
  });
}

export { ToastNotification as T, showToast as s };
