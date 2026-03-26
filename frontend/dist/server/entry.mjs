import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BnpeY9VS.mjs';
import { manifest } from './manifest_gnFT37yo.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/analytics.astro.mjs');
const _page2 = () => import('./pages/auth/login.astro.mjs');
const _page3 = () => import('./pages/auth/profile.astro.mjs');
const _page4 = () => import('./pages/auth/register.astro.mjs');
const _page5 = () => import('./pages/companies/_slug_.astro.mjs');
const _page6 = () => import('./pages/companies.astro.mjs');
const _page7 = () => import('./pages/jobs/_id_.astro.mjs');
const _page8 = () => import('./pages/jobs.astro.mjs');
const _page9 = () => import('./pages/profile.astro.mjs');
const _page10 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/analytics.astro", _page1],
    ["src/pages/auth/login.astro", _page2],
    ["src/pages/auth/profile.astro", _page3],
    ["src/pages/auth/register.astro", _page4],
    ["src/pages/companies/[slug].astro", _page5],
    ["src/pages/companies/index.astro", _page6],
    ["src/pages/jobs/[id].astro", _page7],
    ["src/pages/jobs/index.astro", _page8],
    ["src/pages/profile.astro", _page9],
    ["src/pages/index.astro", _page10]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///F:/CHRIST%20UNIVERSITY%20MCA/III%20Trimester/Go%20lang/Lab_Project/job-data-scraper/frontend/dist/client/",
    "server": "file:///F:/CHRIST%20UNIVERSITY%20MCA/III%20Trimester/Go%20lang/Lab_Project/job-data-scraper/frontend/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
