import 'piccolore';
import { q as decodeKey } from './chunks/astro/server_zN4cY3Wr.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_BFwgewP2.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///F:/CHRIST%20UNIVERSITY%20MCA/III%20Trimester/Go%20lang/Lab_Project/job-data-scraper/frontend/","cacheDir":"file:///F:/CHRIST%20UNIVERSITY%20MCA/III%20Trimester/Go%20lang/Lab_Project/job-data-scraper/frontend/node_modules/.astro/","outDir":"file:///F:/CHRIST%20UNIVERSITY%20MCA/III%20Trimester/Go%20lang/Lab_Project/job-data-scraper/frontend/dist/","srcDir":"file:///F:/CHRIST%20UNIVERSITY%20MCA/III%20Trimester/Go%20lang/Lab_Project/job-data-scraper/frontend/src/","publicDir":"file:///F:/CHRIST%20UNIVERSITY%20MCA/III%20Trimester/Go%20lang/Lab_Project/job-data-scraper/frontend/public/","buildClientDir":"file:///F:/CHRIST%20UNIVERSITY%20MCA/III%20Trimester/Go%20lang/Lab_Project/job-data-scraper/frontend/dist/client/","buildServerDir":"file:///F:/CHRIST%20UNIVERSITY%20MCA/III%20Trimester/Go%20lang/Lab_Project/job-data-scraper/frontend/dist/server/","adapterName":"@astrojs/node","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/node.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/login.D-KM-clF.css"}],"routeData":{"route":"/analytics","isIndex":false,"type":"page","pattern":"^\\/analytics\\/?$","segments":[[{"content":"analytics","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/analytics.astro","pathname":"/analytics","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/login.D-KM-clF.css"}],"routeData":{"route":"/auth/login","isIndex":false,"type":"page","pattern":"^\\/auth\\/login\\/?$","segments":[[{"content":"auth","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/auth/login.astro","pathname":"/auth/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/login.D-KM-clF.css"}],"routeData":{"route":"/auth/profile","isIndex":false,"type":"page","pattern":"^\\/auth\\/profile\\/?$","segments":[[{"content":"auth","dynamic":false,"spread":false}],[{"content":"profile","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/auth/profile.astro","pathname":"/auth/profile","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/login.D-KM-clF.css"}],"routeData":{"route":"/auth/register","isIndex":false,"type":"page","pattern":"^\\/auth\\/register\\/?$","segments":[[{"content":"auth","dynamic":false,"spread":false}],[{"content":"register","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/auth/register.astro","pathname":"/auth/register","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/login.D-KM-clF.css"}],"routeData":{"route":"/companies/[slug]","isIndex":false,"type":"page","pattern":"^\\/companies\\/([^/]+?)\\/?$","segments":[[{"content":"companies","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/companies/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/login.D-KM-clF.css"}],"routeData":{"route":"/companies","isIndex":true,"type":"page","pattern":"^\\/companies\\/?$","segments":[[{"content":"companies","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/companies/index.astro","pathname":"/companies","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/login.D-KM-clF.css"}],"routeData":{"route":"/jobs/[id]","isIndex":false,"type":"page","pattern":"^\\/jobs\\/([^/]+?)\\/?$","segments":[[{"content":"jobs","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/jobs/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/login.D-KM-clF.css"}],"routeData":{"route":"/jobs","isIndex":true,"type":"page","pattern":"^\\/jobs\\/?$","segments":[[{"content":"jobs","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/jobs/index.astro","pathname":"/jobs","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/login.D-KM-clF.css"}],"routeData":{"route":"/profile","isIndex":false,"type":"page","pattern":"^\\/profile\\/?$","segments":[[{"content":"profile","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/profile.astro","pathname":"/profile","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/login.D-KM-clF.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/auth/login.astro",{"propagation":"none","containsHead":true}],["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/auth/register.astro",{"propagation":"none","containsHead":true}],["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/analytics.astro",{"propagation":"none","containsHead":true}],["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/auth/profile.astro",{"propagation":"none","containsHead":true}],["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/companies/[slug].astro",{"propagation":"none","containsHead":true}],["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/companies/index.astro",{"propagation":"none","containsHead":true}],["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/index.astro",{"propagation":"none","containsHead":true}],["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/jobs/[id].astro",{"propagation":"none","containsHead":true}],["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/jobs/index.astro",{"propagation":"none","containsHead":true}],["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/pages/profile.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/analytics@_@astro":"pages/analytics.astro.mjs","\u0000@astro-page:src/pages/auth/login@_@astro":"pages/auth/login.astro.mjs","\u0000@astro-page:src/pages/auth/profile@_@astro":"pages/auth/profile.astro.mjs","\u0000@astro-page:src/pages/auth/register@_@astro":"pages/auth/register.astro.mjs","\u0000@astro-page:src/pages/companies/[slug]@_@astro":"pages/companies/_slug_.astro.mjs","\u0000@astro-page:src/pages/companies/index@_@astro":"pages/companies.astro.mjs","\u0000@astro-page:src/pages/jobs/[id]@_@astro":"pages/jobs/_id_.astro.mjs","\u0000@astro-page:src/pages/jobs/index@_@astro":"pages/jobs.astro.mjs","\u0000@astro-page:src/pages/profile@_@astro":"pages/profile.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/node@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_gnFT37yo.mjs","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/node_modules/unstorage/drivers/fs-lite.mjs":"chunks/fs-lite_COtHaKzy.mjs","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_WAzlnAHp.mjs","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/TrendsChart":"_astro/TrendsChart.Cu0aOpA0.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/SourcesChart":"_astro/SourcesChart.BRk1whwC.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/SkillsChart":"_astro/SkillsChart.t59Bn1ry.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/ExperienceSalaryChart":"_astro/ExperienceSalaryChart.CQa7-14R.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/ProfileView":"_astro/ProfileView.Bn3d8t-P.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/LoginForm":"_astro/LoginForm.Bb6_d7ns.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/RegisterForm":"_astro/RegisterForm.bG0HvkNT.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/SaveJobButton":"_astro/SaveJobButton.Di6ZaKLj.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/MatchScoreBadge":"_astro/MatchScoreBadge.CnZ29E2N.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/AuthNav":"_astro/AuthNav.HNOCBfrt.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/common/Header.astro?astro&type=script&index=0&lang.ts":"_astro/Header.astro_astro_type_script_index_0_lang.BkoFJ0Lt.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/node_modules/@preact/signals/dist/signals.module.js":"_astro/signals.module.BZelEBSY.js","@astrojs/preact/client.js":"_astro/client.WU5j70-2.js","F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/islands/ToastNotification":"_astro/ToastNotification.ooO9wb3Q.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["F:/CHRIST UNIVERSITY MCA/III Trimester/Go lang/Lab_Project/job-data-scraper/frontend/src/components/common/Header.astro?astro&type=script&index=0&lang.ts","const e=document.getElementById(\"mobile-menu-btn\"),n=document.getElementById(\"mobile-menu\");e?.addEventListener(\"click\",()=>{n?.classList.toggle(\"hidden\")});"]],"assets":["/_astro/login.D-KM-clF.css","/favicon.ico","/favicon.svg","/_astro/api.DWmwtNaL.js","/_astro/AuthNav.HNOCBfrt.js","/_astro/chart.Zj-L_LRF.js","/_astro/client.WU5j70-2.js","/_astro/ExperienceSalaryChart.CQa7-14R.js","/_astro/hooks.module.DgMOKmnS.js","/_astro/jsxRuntime.module.BSCWCfwz.js","/_astro/LoginForm.Bb6_d7ns.js","/_astro/MatchScoreBadge.CnZ29E2N.js","/_astro/preact.module.IsPPbktY.js","/_astro/ProfileView.Bn3d8t-P.js","/_astro/RegisterForm.bG0HvkNT.js","/_astro/SaveJobButton.Di6ZaKLj.js","/_astro/signals.module.BZelEBSY.js","/_astro/SkillsChart.t59Bn1ry.js","/_astro/SourcesChart.BRk1whwC.js","/_astro/ToastNotification.Csr-kPXp.js","/_astro/ToastNotification.ooO9wb3Q.js","/_astro/TrendsChart.Cu0aOpA0.js"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"aGP2eNi9lesAoGRPlPeeWhTFOqEJypYHoR0ZDcmZZsQ=","sessionConfig":{"driver":"fs-lite","options":{"base":"F:\\CHRIST UNIVERSITY MCA\\III Trimester\\Go lang\\Lab_Project\\job-data-scraper\\frontend\\node_modules\\.astro\\sessions"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/fs-lite_COtHaKzy.mjs');

export { manifest };
