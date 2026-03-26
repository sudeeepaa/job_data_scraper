function getSalaryRange(job) {
  if (job.salaryMin == null && job.salaryMax == null) {
    return null;
  }
  return {
    min: job.salaryMin ?? 0,
    max: job.salaryMax ?? job.salaryMin ?? 0,
    currency: job.salaryCurrency || "USD"
  };
}
function formatSalaryRange(job) {
  const salary = getSalaryRange(job);
  if (!salary) {
    return null;
  }
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: salary.currency,
    maximumFractionDigits: 0
  });
  return `${money.format(salary.min)} - ${money.format(salary.max)}`;
}
function formatCompactSalary(job) {
  const salary = getSalaryRange(job);
  if (!salary) {
    return null;
  }
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  });
  return `${compact.format(salary.min)} - ${compact.format(salary.max)} ${salary.currency}`;
}
function formatPostedDate(dateString) {
  const date = new Date(dateString);
  const now = /* @__PURE__ */ new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1e3 * 60 * 60 * 24));
  if (diff <= 0) {
    return "Today";
  }
  if (diff === 1) {
    return "Yesterday";
  }
  if (diff < 7) {
    return `${diff} days ago`;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: now.getFullYear() === date.getFullYear() ? void 0 : "numeric"
  });
}
function formatAbsoluteDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function getInitials(name) {
  const parts = name.split(" ").filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "J";
}
function sourceLabel(source) {
  if (!source) {
    return "Live source";
  }
  return source.split(/[-_\s]+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export { formatAbsoluteDate as a, formatCompactSalary as b, formatPostedDate as c, formatSalaryRange as f, getInitials as g, sourceLabel as s };
