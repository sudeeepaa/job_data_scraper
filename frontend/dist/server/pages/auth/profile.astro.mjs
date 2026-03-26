import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_zN4cY3Wr.mjs';
import 'piccolore';
import { $ as $$PageLayout } from '../../chunks/PageLayout_UumKSVf4.mjs';
import { useState, useEffect } from 'preact/hooks';
import { s as showToast } from '../../chunks/ToastNotification_g7H78A2Z.mjs';
import { jsx, jsxs } from 'preact/jsx-runtime';
export { renderers } from '../../renderers.mjs';

function ProfileView() {
  const [activeTab, setActiveTab] = useState("saved");
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("tab") === "saved") {
      setActiveTab("saved");
    } else if (urlParams.get("tab") === "account") {
      setActiveTab("account");
    }
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    const fetchData = async () => {
      try {
        const [userRes, jobsRes] = await Promise.all([fetch("/api/v1/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }), fetch("/api/v1/me/saved-jobs", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })]);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
          setSkills(userData.skills || []);
          setJobTitle(userData.job_title || "");
          setExperience(userData.experience || "");
        } else {
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
          return;
        }
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setSavedJobs(jobsData.data || []);
        }
      } catch (err) {
        console.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleUnsave = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/v1/me/saved-jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
        showToast("Job removed from saved list", "success");
      } else {
        showToast("Failed to remove job", "error");
      }
    } catch (err) {
      showToast("Failed to remove job", "error");
    }
  };
  const handleAddSkill = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !skills.includes(val) && skills.length < 30) {
        setSkills([...skills, val]);
        setSkillInput("");
      }
    }
  };
  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          skills,
          job_title: jobTitle,
          experience
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        showToast("Profile updated — match scores will refresh across all jobs", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to update profile", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setProfileSaving(false);
    }
  };
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (!currentPassword) return setPasswordError("Current password is required");
    if (!newPassword) return setPasswordError("New password is required");
    if (newPassword.length < 6) return setPasswordError("New password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setPasswordError("Passwords do not match");
    setPasswordLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/v1/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("Password updated successfully", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        setPasswordError(data.message || "Failed to update password");
      }
    } catch (err) {
      setPasswordError("Something went wrong");
    } finally {
      setPasswordLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };
  if (loading) {
    return jsx("div", {
      class: "flex justify-center py-20",
      children: jsxs("svg", {
        class: "h-10 w-10 animate-spin text-espresso",
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
          fill: "currentColor",
          d: "M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.95 7.95 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z"
        })]
      })
    });
  }
  if (!user) return null;
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long"
  });
  return jsxs("div", {
    class: "mx-auto max-w-[1180px] px-6 py-12",
    children: [jsx("h1", {
      class: "text-4xl font-extrabold text-espresso mb-8",
      children: "Your Profile"
    }), jsxs("div", {
      class: "flex flex-col lg:flex-row gap-10",
      children: [jsx("aside", {
        class: "lg:w-64 shrink-0",
        children: jsxs("nav", {
          class: "flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0",
          children: [jsx("button", {
            onClick: () => setActiveTab("saved"),
            class: `text-left px-5 py-3 rounded-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "saved" ? "bg-espresso text-cream shadow-md" : "text-walnut hover:bg-off-white hover:text-espresso"}`,
            children: "Saved Jobs"
          }), jsx("button", {
            onClick: () => setActiveTab("account"),
            class: `text-left px-5 py-3 rounded-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "account" ? "bg-espresso text-cream shadow-md" : "text-walnut hover:bg-off-white hover:text-espresso"}`,
            children: "Account Settings"
          })]
        })
      }), jsxs("div", {
        class: "flex-1 bg-white rounded-[24px] border border-sand shadow-sm min-h-[500px] p-6 sm:p-10",
        children: [activeTab === "saved" && jsxs("div", {
          children: [jsx("h2", {
            class: "text-2xl font-extrabold text-espresso mb-6",
            children: "Saved Jobs"
          }), savedJobs.length === 0 ? jsxs("div", {
            class: "text-center py-16 px-4 bg-off-white rounded-[16px] border border-sand",
            children: [jsx("h3", {
              class: "text-xl font-bold text-espresso mb-2",
              children: "You haven't saved any jobs yet."
            }), jsx("p", {
              class: "text-walnut font-medium mb-6",
              children: "Keep track of interesting roles by saving them as you browse."
            }), jsx("a", {
              href: "/jobs",
              class: "inline-block bg-espresso text-white font-bold px-8 py-3 rounded-[8px] hover:bg-walnut transition-colors",
              children: "Browse jobs →"
            })]
          }) : jsx("div", {
            class: "grid gap-5 md:grid-cols-2 lg:grid-cols-2",
            children: savedJobs.map((job) => jsxs("div", {
              class: "rounded-[12px] border border-sand bg-white p-5 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow",
              children: [jsx("h3", {
                class: "text-lg font-bold text-espresso line-clamp-2",
                children: job.title
              }), jsxs("p", {
                class: "text-walnut text-sm mt-1 mb-4",
                children: [job.company, " • ", job.location]
              }), jsxs("div", {
                class: "mt-auto pt-4 border-t border-sand w-full flex justify-between items-center gap-4",
                children: [jsx("a", {
                  href: `/jobs/${job.id}`,
                  class: "text-sm font-bold text-espresso hover:underline",
                  children: "View post"
                }), jsx("button", {
                  onClick: () => handleUnsave(job.id),
                  class: "text-sm font-bold text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-[6px]",
                  children: "Unsave"
                })]
              })]
            }, job.id))
          })]
        }), activeTab === "account" && jsxs("div", {
          class: "max-w-xl",
          children: [jsx("h2", {
            class: "text-2xl font-extrabold text-espresso mb-6",
            children: "Account Settings"
          }), jsxs("div", {
            class: "bg-off-white border border-sand rounded-[16px] p-6 mb-8 flex items-center gap-6",
            children: [jsx("div", {
              class: "h-16 w-16 bg-espresso rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0",
              children: user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()
            }), jsxs("div", {
              children: [jsx("p", {
                class: "text-lg font-bold text-espresso",
                children: user.name || "User"
              }), jsx("p", {
                class: "text-walnut font-medium text-sm",
                children: user.email
              }), jsxs("p", {
                class: "text-xs text-walnut mt-1 font-bold bg-sand/20 inline-block px-3 py-1 rounded-full uppercase tracking-wider",
                children: ["Member since ", memberSince]
              })]
            })]
          }), jsxs("div", {
            class: "mb-10",
            children: [jsx("h3", {
              class: "text-lg font-bold text-espresso py-2 border-b border-sand mb-6",
              children: "My Skills"
            }), jsxs("div", {
              class: "mb-4",
              children: [jsx("label", {
                class: "mb-2 block text-sm font-semibold text-espresso",
                children: "Skills"
              }), jsx("div", {
                class: "flex flex-wrap gap-2 mb-3",
                children: skills.map((skill) => jsxs("span", {
                  class: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold",
                  style: {
                    backgroundColor: "#FFDBBB",
                    color: "#664930"
                  },
                  children: [skill, jsx("button", {
                    type: "button",
                    onClick: () => handleRemoveSkill(skill),
                    class: "hover:opacity-70 transition-opacity leading-none text-base",
                    "aria-label": `Remove ${skill}`,
                    children: "×"
                  })]
                }, skill))
              }), jsx("input", {
                type: "text",
                value: skillInput,
                onInput: (e) => setSkillInput(e.target.value),
                onKeyDown: handleAddSkill,
                placeholder: skills.length >= 30 ? "Maximum 30 skills" : "Type a skill, press Enter to add",
                disabled: skills.length >= 30,
                class: "w-full rounded-[8px] bg-white border border-sand px-4 py-3 text-sm text-espresso outline-none focus:border-walnut disabled:opacity-50"
              }), jsxs("p", {
                class: "text-xs text-walnut mt-1",
                children: [skills.length, "/30 skills"]
              })]
            }), jsxs("div", {
              class: "mb-4",
              children: [jsx("label", {
                class: "mb-2 block text-sm font-semibold text-espresso",
                children: "Desired Role"
              }), jsx("input", {
                type: "text",
                value: jobTitle,
                onInput: (e) => setJobTitle(e.target.value),
                placeholder: "e.g. Full Stack Developer",
                class: "w-full rounded-[8px] bg-white border border-sand px-4 py-3 text-sm text-espresso outline-none focus:border-walnut"
              })]
            }), jsxs("div", {
              class: "mb-5",
              children: [jsx("label", {
                class: "mb-2 block text-sm font-semibold text-espresso",
                children: "Experience Level"
              }), jsxs("select", {
                value: experience,
                onChange: (e) => setExperience(e.target.value),
                class: "w-full rounded-[8px] border border-sand bg-white px-4 py-3 text-sm text-espresso outline-none focus:border-walnut",
                children: [jsx("option", {
                  value: "",
                  children: "Select level"
                }), jsx("option", {
                  value: "entry",
                  children: "Entry Level"
                }), jsx("option", {
                  value: "mid",
                  children: "Mid Level"
                }), jsx("option", {
                  value: "senior",
                  children: "Senior Level"
                })]
              })]
            }), jsx("button", {
              type: "button",
              onClick: handleSaveProfile,
              disabled: profileSaving,
              class: "w-full sm:w-auto px-6 py-3 rounded-[8px] bg-espresso text-cream font-bold hover:bg-walnut transition-colors disabled:opacity-70",
              children: profileSaving ? "Saving..." : "Save Profile"
            }), jsx("p", {
              class: "mt-3 text-xs font-medium",
              style: {
                color: "#997E67"
              },
              children: "Your match scores will update across all job listings"
            })]
          }), jsxs("form", {
            onSubmit: handlePasswordChange,
            class: "space-y-6",
            children: [jsx("h3", {
              class: "text-lg font-bold text-espresso py-2 border-b border-sand",
              children: "Change Password"
            }), passwordError && jsx("div", {
              class: "rounded-[8px] border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-600",
              children: passwordError
            }), jsxs("div", {
              class: "relative pt-2",
              children: [jsx("input", {
                id: "currentPassword",
                type: "password",
                value: currentPassword,
                onInput: (e) => setCurrentPassword(e.target.value),
                onFocus: () => setFocusedField("currentPassword"),
                onBlur: () => setFocusedField(null),
                class: "peer w-full rounded-[8px] bg-white border border-sand px-4 pb-3 pt-6 text-espresso text-sm font-medium outline-none transition-all focus:border-walnut"
              }), jsx("label", {
                for: "currentPassword",
                class: `pointer-events-none absolute left-4 transition-all text-walnut font-bold ${focusedField === "currentPassword" || currentPassword ? "top-4 text-xs" : "top-6 text-sm"}`,
                children: "Current Password"
              })]
            }), jsxs("div", {
              class: "relative pt-2",
              children: [jsx("input", {
                id: "newPassword",
                type: "password",
                value: newPassword,
                onInput: (e) => setNewPassword(e.target.value),
                onFocus: () => setFocusedField("newPassword"),
                onBlur: () => setFocusedField(null),
                class: "peer w-full rounded-[8px] bg-white border border-sand px-4 pb-3 pt-6 text-espresso text-sm font-medium outline-none transition-all focus:border-walnut"
              }), jsx("label", {
                for: "newPassword",
                class: `pointer-events-none absolute left-4 transition-all text-walnut font-bold ${focusedField === "newPassword" || newPassword ? "top-4 text-xs" : "top-6 text-sm"}`,
                children: "New Password"
              })]
            }), jsxs("div", {
              class: "relative pt-2",
              children: [jsx("input", {
                id: "confirmPassword",
                type: "password",
                value: confirmPassword,
                onInput: (e) => setConfirmPassword(e.target.value),
                onFocus: () => setFocusedField("confirmPassword"),
                onBlur: () => setFocusedField(null),
                class: "peer w-full rounded-[8px] bg-white border border-sand px-4 pb-3 pt-6 text-espresso text-sm font-medium outline-none transition-all focus:border-walnut"
              }), jsx("label", {
                for: "confirmPassword",
                class: `pointer-events-none absolute left-4 transition-all text-walnut font-bold ${focusedField === "confirmPassword" || confirmPassword ? "top-4 text-xs" : "top-6 text-sm"}`,
                children: "Confirm New Password"
              })]
            }), jsx("button", {
              type: "submit",
              disabled: passwordLoading,
              class: "w-full sm:w-auto px-6 py-3 rounded-[8px] bg-espresso text-cream font-bold hover:bg-walnut transition-colors disabled:opacity-70",
              children: passwordLoading ? "Updating..." : "Update Password"
            })]
          }), jsx("div", {
            class: "mt-12 pt-8 border-t border-sand",
            children: jsx("button", {
              onClick: handleLogout,
              class: "w-full sm:w-auto px-6 py-3 rounded-[8px] border-2 border-red-200 text-red-700 bg-red-50 font-bold hover:bg-red-100 transition-colors",
              children: "Log out of all devices"
            })
          })]
        })]
      })]
    })]
  });
}

const $$Profile = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": "My Profile | JobPulse", "description": "Your JobPulse profile and saved jobs" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="mx-auto max-w-[1180px] px-6 py-14"> <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <h1 class="text-4xl font-extrabold tracking-tight text-espresso">Dashboard</h1> <p class="mt-2 text-lg text-walnut">Manage your account and review your saved opportunities.</p> </div> </div> ${renderComponent($$result2, "ProfileView", ProfileView, { "client:load": true, "client:component-hydration": "load", "client:component-path": "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/ProfileView", "client:component-export": "default" })} </section> ` })}`;
}, "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/auth/profile.astro", void 0);

const $$file = "F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/auth/profile.astro";
const $$url = "/auth/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Profile,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
