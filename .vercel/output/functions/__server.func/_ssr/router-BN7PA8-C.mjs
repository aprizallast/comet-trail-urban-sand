import { i as __toESM, n as __exportAll } from "../_runtime.mjs";
import { K as require_react, _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BN7PA8-C.js
var router_BN7PA8_C_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName$2 = "/app/applet/src/lib/error-component.tsx";
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				}, void 0, false, {
					fileName: _jsxFileName$2,
					lineNumber: 21,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 20,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 23,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 24,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$2,
		lineNumber: 14,
		columnNumber: 5
	}, this);
}
var _jsxFileName$1 = "/app/applet/src/lib/auth/provider.tsx";
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children }, void 0, false, {
		fileName: _jsxFileName$1,
		lineNumber: 14,
		columnNumber: 10
	}, this);
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-Dq2R__tp.css";
var _jsxFileName = "/app/applet/src/routes/__root.tsx";
var APP_NAME = "Agent BREW";
var APP_DESC = "Live launchpad radar for brew.family tokens on BNB Chain — tape, dev clusters, and a tactical copilot.";
var Route$10 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: APP_DESC
			},
			{
				property: "og:title",
				content: APP_NAME
			},
			{
				property: "og:description",
				content: APP_DESC
			},
			{
				name: "theme-color",
				content: "#0c0806"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Outfit:wght@400;600;700;800&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("head", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("script", { dangerouslySetInnerHTML: { __html: "try{var t=localStorage.getItem('agent-brew-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}" } }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 39,
			columnNumber: 9
		}, void 0), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(HeadContent, {}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 45,
			columnNumber: 9
		}, void 0)] }, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 38,
			columnNumber: 7
		}, void 0), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreviewHostBridge, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 48,
				columnNumber: 9
			}, void 0),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Outlet, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 50,
				columnNumber: 11
			}, void 0) }, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 49,
				columnNumber: 9
			}, void 0),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Scripts, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 52,
				columnNumber: 9
			}, void 0)
		] }, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 47,
			columnNumber: 7
		}, void 0)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 37,
		columnNumber: 5
	}, void 0)
});
var $$splitComponentImporter = () => import("./routes-BYlE44L8.mjs");
var Route$9 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var geckoTokenCache = /* @__PURE__ */ new Map();
var geckoPoolCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS$1 = 6e4;
var Route$8 = createFileRoute("/api/coingecko")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const rawAddrs = url.searchParams.get("addrs") || url.searchParams.get("address") || "";
	const rawPool = url.searchParams.get("pool") || "";
	const addrs = rawAddrs.split(",").map((a) => a.trim().toLowerCase()).filter((a) => /^0x[a-f0-9]{40}$/.test(a)).slice(0, 30);
	const poolAddr = rawPool.trim().toLowerCase();
	if (poolAddr && /^0x[a-f0-9]{40}$/.test(poolAddr)) {
		const cachedPool = geckoPoolCache.get(poolAddr);
		if (cachedPool && Date.now() - cachedPool.at < CACHE_TTL_MS$1) return Response.json(cachedPool.data);
		try {
			const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/bsc/pools/${poolAddr}`, { headers: {
				accept: "application/json",
				"user-agent": "AgentBREW/1.0"
			} });
			if (res.ok) {
				const attr = (await res.json())?.data?.attributes;
				const formatted = {
					provider: "coingecko_geckoterminal",
					poolAddress: poolAddr,
					name: attr?.name || "",
					baseTokenPriceUsd: parseFloat(attr?.base_token_price_usd || "0"),
					quoteTokenPriceUsd: parseFloat(attr?.quote_token_price_usd || "0"),
					reserveUsd: parseFloat(attr?.reserve_in_usd || "0"),
					volume24h: parseFloat(attr?.volume_usd?.h24 || "0"),
					priceChange24h: parseFloat(attr?.price_change_percentage?.h24 || "0"),
					txns24h: {
						buys: attr?.transactions?.h24?.buys || 0,
						sells: attr?.transactions?.h24?.sells || 0
					},
					fdvUsd: parseFloat(attr?.fdv_usd || "0"),
					dexUrl: `https://www.geckoterminal.com/bsc/pools/${poolAddr}`,
					raw: attr
				};
				geckoPoolCache.set(poolAddr, {
					at: Date.now(),
					data: formatted
				});
				return Response.json(formatted);
			}
		} catch {
			if (cachedPool) return Response.json(cachedPool.data);
		}
	}
	if (addrs.length === 0) return Response.json({
		provider: "coingecko_geckoterminal",
		tokens: [],
		error: "No valid BSC contract addresses provided"
	});
	const cacheKey = addrs.join(",");
	const cached = geckoTokenCache.get(cacheKey);
	if (cached && Date.now() - cached.at < CACHE_TTL_MS$1) return Response.json(cached.data);
	try {
		const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/bsc/tokens/multi/${addrs.join(",")}`, { headers: {
			accept: "application/json",
			"user-agent": "AgentBREW/1.0"
		} });
		if (!res.ok) {
			if (cached) return Response.json(cached.data);
			return Response.json({
				provider: "coingecko_geckoterminal",
				tokens: [],
				status: res.status
			});
		}
		const body = await res.json();
		const tokens = (Array.isArray(body?.data) ? body.data : []).map((row) => {
			const attr = row?.attributes || {};
			const cleanAddr = String(attr.address || row.id || "").toLowerCase().replace(/^bsc_/, "");
			return {
				address: cleanAddr,
				name: attr.name || "",
				symbol: attr.symbol || "",
				priceUsd: parseFloat(attr.price_usd || "0"),
				fdvUsd: parseFloat(attr.fdv_usd || "0"),
				marketCapUsd: parseFloat(attr.market_cap_usd || attr.fdv_usd || "0"),
				totalReserveUsd: parseFloat(attr.total_reserve_in_usd || "0"),
				volume24h: parseFloat(attr.volume_usd?.h24 || "0"),
				imageUrl: attr.image_url || null,
				coingeckoCoinId: attr.coingecko_coin_id || null,
				dexUrl: `https://www.geckoterminal.com/bsc/tokens/${cleanAddr}`
			};
		});
		const result = {
			provider: "coingecko_geckoterminal",
			network: "bsc",
			updatedAt: Date.now(),
			tokens
		};
		geckoTokenCache.set(cacheKey, {
			at: Date.now(),
			data: result
		});
		return Response.json(result);
	} catch {
		if (cached) return Response.json(cached.data);
		return Response.json({
			provider: "coingecko_geckoterminal",
			tokens: [],
			error: "GeckoTerminal request failed"
		});
	}
} } } });
var BREW_SHARED_API = "https://brew.family/api/shared/launches";
var FACTORY = "0xeea6c3bfb29fd9a35380438956bae7b109c63d85";
var TTL_MS = 6e4;
var memory = null;
function mapLaunches(launches) {
	const creatorCounts = {};
	for (const l of launches) {
		const c = String(l.creator || "").toLowerCase().trim();
		if (c) creatorCounts[c] = (creatorCounts[c] || 0) + 1;
	}
	const multiTokenDevs = Object.values(creatorCounts).filter((n) => n > 1).length;
	const tokens = launches.map((l, idx) => {
		const rawImg = String(l.imageUrl || l.image || "");
		let artContract = "";
		let logoUrl = "";
		if (rawImg.startsWith("onchain://56/")) {
			artContract = rawImg.replace("onchain://56/", "").toLowerCase().trim();
			logoUrl = `/api/artwork/${artContract}`;
		} else if (rawImg.startsWith("data:image") || rawImg.startsWith("http")) logoUrl = rawImg;
		const address = String(l.address || "");
		const creator = String(l.creator || "");
		const cAddr = creator.toLowerCase().trim();
		const launchCount = creatorCounts[cAddr] || 1;
		const marketCap = Number(l.marketCapUsd || l.marketCap || 0) || 0;
		const volume24h = Number(l.volume24hUsd || l.volume24h || l.trendingScore || 0) || 0;
		let agentScore = 50;
		let agentVerdict = "NETRAL";
		const agentSignals = [];
		if (launchCount >= 4) {
			agentScore = 22;
			agentVerdict = "RISIKO TINGGI";
			agentSignals.push(`Serial deployer (${launchCount} tokens)`);
		} else if (launchCount === 1) {
			agentScore = 68;
			agentSignals.push("Single-contract dev");
		} else {
			agentScore = 48;
			agentSignals.push(`${launchCount} launches from this wallet`);
		}
		if (String(l.description || "").length > 30) {
			agentScore += 4;
			agentSignals.push("Project description present");
		}
		if (l.twitter || l.website) {
			agentScore += 8;
			agentSignals.push("Social link present");
		}
		if (volume24h > 5e3) agentScore = Math.min(96, agentScore + 10);
		if (marketCap > 2e4) agentScore = Math.min(97, agentScore + 6);
		if (agentScore >= 75) agentVerdict = "AMAN";
		else if (agentScore >= 50 && agentVerdict !== "RISIKO TINGGI") agentVerdict = "NETRAL";
		const pool = String(l.pool || "");
		const txHash = String(l.transactionHash || l.txHash || "");
		const baseMcap = marketCap > 0 ? marketCap : 4938.37;
		const basePrice = baseMcap / 1e9;
		return {
			index: idx + 1,
			address,
			pool,
			creator,
			creatorLaunchCount: launchCount,
			name: String(l.name || "Brew Token"),
			symbol: String(l.symbol || "BREW"),
			quoteSymbol: String(l.quoteSymbol || "WBNB"),
			quoteAddress: String(l.quoteAddress || ""),
			launchedAt: Number(l.launchedAt || Date.now()),
			blockNumber: Number(l.blockNumber || 0),
			txHash,
			logoUrl,
			fallbackLogoUrl: address ? `https://dd.dexscreener.com/ds-data/tokens/bsc/${address}.png` : "",
			onchainArtworkContract: artContract,
			description: String(l.description || ""),
			twitterUrl: String(l.twitter || ""),
			websiteUrl: String(l.website || ""),
			telegramUrl: String(l.telegram || ""),
			priceUsd: basePrice,
			priceChange24h: null,
			volume24h,
			liquidityUsd: 0,
			marketCap: baseMcap,
			buys24h: 0,
			sells24h: 0,
			buyRatio: 1,
			agentScore,
			agentVerdict,
			agentSignals,
			dexUrl: `https://dexscreener.com/bsc/${pool || address}`,
			brewUrl: `https://brew.family/token/${address}`,
			bubblemapsUrl: `https://bubblemaps.io/bsc/token/${address}`,
			bscscanTokenUrl: `https://bscscan.com/token/${address}`,
			bscscanCreatorUrl: creator ? `https://bscscan.com/address/${creator}` : "",
			bscscanTxUrl: txHash ? `https://bscscan.com/tx/${txHash}` : ""
		};
	});
	let totalVol = 0;
	let totalMcap = 0;
	let activePairs = 0;
	for (const t of tokens) if (t.volume24h > 0 || t.marketCap > 0) {
		activePairs++;
		totalVol += t.volume24h;
		totalMcap += t.marketCap;
	}
	return {
		totalLaunches: tokens.length,
		factory: FACTORY,
		updatedAt: Date.now(),
		stats: {
			totalTrackedVol: Math.round(totalVol * 100) / 100,
			totalTrackedMcap: Math.round(totalMcap * 100) / 100,
			activePairs,
			multiTokenDevs
		},
		tokens,
		source: "brew.family"
	};
}
var dexCache = /* @__PURE__ */ new Map();
var DEX_TTL_MS = 9e4;
function applyPair(token, pair) {
	const isBase = (pair.baseToken?.address || "").toLowerCase() === token.address.toLowerCase();
	const price = parseFloat(pair.priceUsd || "") || 0;
	const vol = pair.volume?.h24 != null ? Number(pair.volume.h24) : 0;
	const liq = pair.liquidity?.usd != null ? Number(pair.liquidity.usd) : 0;
	const mcap = Number(pair.marketCap || pair.fdv || 0);
	if (isBase && price > 0) token.priceUsd = price;
	if (vol > 0) token.volume24h = Math.max(token.volume24h, vol);
	if (liq > 0) token.liquidityUsd = liq;
	if (mcap > 0 && (token.marketCap === 0 || mcap > token.marketCap)) token.marketCap = mcap;
	if (pair.priceChange?.h24 != null && Number.isFinite(Number(pair.priceChange.h24))) token.priceChange24h = Number(pair.priceChange.h24);
	if (pair.info?.imageUrl && !token.logoUrl) token.logoUrl = pair.info.imageUrl;
	if (pair.pairAddress) token.pool = pair.pairAddress;
	if (pair.url) token.dexUrl = pair.url;
	const buys = Number(pair.txns?.h24?.buys || 0);
	const sells = Number(pair.txns?.h24?.sells || 0);
	if (buys || sells) {
		token.buys24h = buys;
		token.sells24h = sells;
		token.buyRatio = sells > 0 ? Math.round(buys / sells * 100) / 100 : token.buyRatio;
	}
	if ((!token.priceUsd || token.priceUsd === 0) && token.marketCap > 0) token.priceUsd = token.marketCap / 1e9;
}
async function fetchDexChunk(addrs) {
	const res = await fetch(`https://api.dexscreener.com/tokens/v1/bsc/${addrs.join(",")}`, { headers: {
		accept: "application/json",
		"user-agent": "AgentBREW/1.0"
	} });
	if (res.status === 429) return false;
	const body = res.ok ? await res.json() : [];
	const pairs = Array.isArray(body) ? body : [];
	const best = /* @__PURE__ */ new Map();
	for (const pair of pairs) {
		const baseAddr = (pair.baseToken?.address || "").toLowerCase();
		const quoteAddr = (pair.quoteToken?.address || "").toLowerCase();
		const liq = pair.liquidity?.usd || 0;
		if (baseAddr) {
			const prev = best.get(baseAddr);
			if (!prev || liq > (prev.liquidity?.usd || 0)) best.set(baseAddr, pair);
		}
		if (quoteAddr) {
			const prev = best.get(quoteAddr);
			if (!prev || liq > (prev.liquidity?.usd || 0)) best.set(quoteAddr, pair);
		}
	}
	const now = Date.now();
	for (const addr of addrs) {
		const p = best.get(addr);
		if (p) dexCache.set(addr, {
			at: now,
			pair: p
		});
	}
	return pairs.length > 0;
}
async function fetchGeckoChunk(addrs) {
	const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/bsc/tokens/multi/${addrs.join(",")}`, { headers: {
		accept: "application/json",
		"user-agent": "AgentBREW/1.0"
	} });
	if (!res.ok) return false;
	const body = await res.json();
	const rows = Array.isArray(body?.data) ? body.data : [];
	const now = Date.now();
	for (const row of rows) {
		const addr = String(row?.attributes?.address || row?.id || "").toLowerCase().replace(/^bsc_/, "");
		const attr = row?.attributes || {};
		const h24 = attr?.price_change_percentage?.h24;
		if (!addr) continue;
		const pair = {
			baseToken: { address: addr },
			priceUsd: attr.price_usd != null ? String(attr.price_usd) : void 0,
			priceChange: h24 != null ? { h24: Number(h24) } : void 0,
			volume: attr.volume_usd?.h24 != null ? { h24: Number(attr.volume_usd.h24) } : void 0,
			liquidity: attr.total_reserve_in_usd != null ? { usd: Number(attr.total_reserve_in_usd) } : void 0,
			marketCap: attr.market_cap_usd != null ? Number(attr.market_cap_usd) : attr.fdv_usd != null ? Number(attr.fdv_usd) : void 0,
			fdv: attr.fdv_usd != null ? Number(attr.fdv_usd) : void 0
		};
		dexCache.set(addr, {
			at: now,
			pair
		});
	}
	return rows.length > 0;
}
async function enrichValuations(tokens) {
	const seen = /* @__PURE__ */ new Set();
	const candidates = [];
	const byVol = [...tokens].filter((t) => t.volume24h > 0).sort((a, b) => b.volume24h - a.volume24h).slice(0, 80);
	const byMcap = [...tokens].filter((t) => t.marketCap > 0).sort((a, b) => b.marketCap - a.marketCap).slice(0, 50);
	const newest = tokens.slice(0, 40);
	for (const t of [
		...byVol,
		...byMcap,
		...newest
	]) {
		const k = t.address.toLowerCase();
		if (k && !seen.has(k)) {
			seen.add(k);
			candidates.push(t);
		}
	}
	const chunks = [];
	for (let i = 0; i < candidates.length; i += 10) chunks.push(candidates.slice(i, i + 10));
	const batchSize = 5;
	for (let b = 0; b < chunks.length; b += batchSize) {
		const batch = chunks.slice(b, b + batchSize);
		await Promise.allSettled(batch.map(async (chunk) => {
			const url = `https://brew.family/api/shared/launches/valuations?addresses=${chunk.map((t) => t.address).join(",")}`;
			try {
				const res = await fetch(url, { headers: {
					accept: "application/json",
					"user-agent": "AgentBREW/1.0"
				} });
				if (!res.ok) return;
				const data = await res.json();
				const by = new Map((data.valuations || []).map((v) => [String(v.address || "").toLowerCase(), v]));
				for (const token of chunk) {
					const v = by.get(token.address.toLowerCase());
					if (!v) continue;
					if (v.priceUsd && Number(v.priceUsd) > 0) token.priceUsd = Number(v.priceUsd);
					if (v.marketCapUsd && Number(v.marketCapUsd) > 0) token.marketCap = Number(v.marketCapUsd);
					if (v.pool && !token.pool) token.pool = v.pool;
				}
			} catch {}
		}));
	}
}
async function enrichWithDex(tokens) {
	const now = Date.now();
	const seen = /* @__PURE__ */ new Set();
	const candidates = [];
	const byVol = [...tokens].filter((t) => t.volume24h > 0).sort((a, b) => b.volume24h - a.volume24h).slice(0, 60);
	const byMcap = [...tokens].filter((t) => t.marketCap > 0).sort((a, b) => b.marketCap - a.marketCap).slice(0, 30);
	const newest = tokens.slice(0, 20);
	for (const t of [
		...byVol,
		...byMcap,
		...newest
	]) {
		const k = t.address.toLowerCase();
		if (k && !seen.has(k)) {
			seen.add(k);
			candidates.push(t);
		}
	}
	const stale = candidates.filter((t) => {
		const hit = dexCache.get(t.address.toLowerCase());
		return !hit || now - hit.at > DEX_TTL_MS;
	});
	for (let i = 0; i < stale.length; i += 30) {
		const chunk = stale.slice(i, i + 30).map((t) => t.address.toLowerCase());
		let ok = false;
		try {
			ok = await fetchDexChunk(chunk);
		} catch {
			ok = false;
		}
		if (!ok) try {
			ok = await fetchGeckoChunk(chunk);
		} catch {
			ok = false;
		}
		if (i + 30 < stale.length) await new Promise((r) => setTimeout(r, 400));
	}
	for (const token of tokens) {
		const hit = dexCache.get(token.address.toLowerCase());
		if (hit?.pair) applyPair(token, hit.pair);
	}
}
function recomputeStats(payload) {
	let totalVol = 0;
	let totalMcap = 0;
	let activePairs = 0;
	for (const t of payload.tokens) if (t.volume24h > 0 || t.liquidityUsd > 0 || t.marketCap > 0) {
		activePairs++;
		totalVol += t.volume24h || 0;
		totalMcap += t.marketCap || 0;
	}
	payload.stats.totalTrackedVol = Math.round(totalVol * 100) / 100;
	payload.stats.totalTrackedMcap = Math.round(totalMcap * 100) / 100;
	payload.stats.activePairs = activePairs;
	payload.source = "brew.family+dex";
}
async function getTokensPayload(force = false) {
	if (!force && memory && Date.now() - memory.at < TTL_MS) return memory.payload;
	try {
		const text = await (await fetch(BREW_SHARED_API, { headers: {
			accept: "application/json",
			"user-agent": "AgentBREW/1.0"
		} })).text();
		if (!text || text.trim().startsWith("<")) {
			if (memory) return memory.payload;
			throw new Error("Launchpad returned a non-JSON response");
		}
		const data = JSON.parse(text);
		const launches = Array.isArray(data) ? data : data.tokens || data.launches || [];
		if (!Array.isArray(launches) || launches.length < 5) {
			if (memory) return memory.payload;
			throw new Error("Launchpad payload was empty");
		}
		const payload = mapLaunches(launches);
		await enrichValuations(payload.tokens);
		await enrichWithDex(payload.tokens);
		const needsValuation = payload.tokens.filter((t) => t.volume24h > 50 && (!t.priceUsd || t.priceUsd === 0 || !t.marketCap || t.marketCap === 0));
		if (needsValuation.length > 0) await enrichValuations(needsValuation.slice(0, 30));
		for (const t of payload.tokens) if ((!t.priceUsd || t.priceUsd === 0) && t.marketCap > 0) t.priceUsd = t.marketCap / 1e9;
		else if (t.priceUsd > 0 && (!t.marketCap || t.marketCap === 0)) t.marketCap = t.priceUsd * 1e9;
		recomputeStats(payload);
		memory = {
			at: Date.now(),
			payload
		};
		return payload;
	} catch (err) {
		if (memory) return memory.payload;
		throw err;
	}
}
async function searchTokens(query) {
	const q = query.trim();
	if (!q) return {
		tokens: [],
		count: 0,
		searchQuery: ""
	};
	const payload = await getTokensPayload(false);
	const s = q.toLowerCase();
	const tokens = payload.tokens.filter((t) => t.symbol.toLowerCase().includes(s) || t.name.toLowerCase().includes(s) || t.address.toLowerCase().includes(s) || t.creator.toLowerCase().includes(s)).slice(0, 40);
	return {
		tokens,
		count: tokens.length,
		searchQuery: q
	};
}
function snapshotForCopilot(tokens) {
	const byVol = [...tokens].sort((a, b) => b.volume24h - a.volume24h).slice(0, 12);
	const newest = tokens.slice(0, 8);
	const seen = /* @__PURE__ */ new Set();
	const rows = [];
	for (const t of [...byVol, ...newest]) {
		const key = t.address.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		rows.push({
			symbol: t.symbol,
			name: t.name,
			address: t.address,
			mcap: Math.round(t.marketCap),
			vol24h: Math.round(t.volume24h),
			launchesByDev: t.creatorLaunchCount,
			score: t.agentScore,
			verdict: t.agentVerdict,
			quote: t.quoteSymbol
		});
	}
	return rows;
}
function heuristic(prompt, tokens) {
	const p = prompt.toLowerCase();
	let reply = "";
	let matched = [];
	if (/top|pick|best|rekomendasi|精选|推荐|おすすめ|厳選|bagus/.test(p)) {
		matched = [...tokens].filter((t) => t.volume24h > 0 || t.marketCap > 1e3).sort((a, b) => b.agentScore - a.agentScore || b.volume24h - a.volume24h).slice(0, 3);
		reply = matched.length > 0 ? `Top conviction from the live brew.family tape:\n\n` + matched.map((t, i) => `#${i + 1} ${t.symbol} (${t.name})\nScore ${t.agentScore}/100 · ${t.agentVerdict}\nMCap $${Math.round(t.marketCap).toLocaleString()} · 24h vol $${Math.round(t.volume24h).toLocaleString()}\nDev launches: ${t.creatorLaunchCount}`).join("\n\n") + `\n\nNot financial advice. Size small and check GoPlus before you buy.` : "No liquid names in the current snapshot. Refresh the radar and try again.";
	} else if (/serial|risk|rug|scam|bahaya|跑路|风险|リスク/.test(p)) {
		matched = tokens.filter((t) => t.creatorLaunchCount >= 4).slice(0, 3);
		reply = `Serial-dev cluster: ${tokens.filter((t) => t.creatorLaunchCount >= 4).length} tokens were launched by wallets with 4+ brew.family contracts. Repeat deployers abandon liquidity more often. Open BubbleMaps and a GoPlus honeypot check before touching them.`;
	} else if (/safe|aman|single|gem|安全/.test(p)) {
		matched = tokens.filter((t) => t.creatorLaunchCount === 1 && (t.volume24h > 0 || t.marketCap > 2e3)).slice(0, 3);
		reply = `Single-contract names with a live market print: ${matched.map((t) => t.symbol).join(", ") || "none in the top of the tape"}. One-project deployers are a softer risk signal, not a guarantee.`;
	} else if (/volume|vol|rame|取引/.test(p)) {
		matched = [...tokens].sort((a, b) => b.volume24h - a.volume24h).slice(0, 3);
		reply = "Highest 24h volume on the launchpad feed:\n\n" + matched.map((t, i) => `#${i + 1} ${t.symbol}: $${Math.round(t.volume24h).toLocaleString()} · mcap $${Math.round(t.marketCap).toLocaleString()}`).join("\n");
	} else reply = `Agent BREW heard: "${prompt}".\n\nTry:\n• top picks\n• serial deployer risk\n• single-contract gems\n• highest volume`;
	return {
		reply,
		tokensMatch: matched
	};
}
var Route$7 = createFileRoute("/api/copilot")({ server: { handlers: { POST: async ({ request }) => {
	let prompt = "";
	try {
		const body = await request.json();
		prompt = String(body?.prompt || "").trim().slice(0, 500);
	} catch {
		return Response.json({ error: "Expected JSON" }, { status: 400 });
	}
	if (!prompt) return Response.json({ error: "Prompt is required" }, { status: 400 });
	let tokens = [];
	try {
		tokens = (await getTokensPayload(false)).tokens;
	} catch {
		tokens = [];
	}
	const apiKey = process.env.XAI_API_KEY;
	if (apiKey && tokens.length > 0) try {
		const snapshot = snapshotForCopilot(tokens);
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				max_tokens: 420,
				temperature: .3,
				messages: [{
					role: "system",
					content: "You are Agent BREW, a terse launchpad analyst for brew.family tokens on BNB Chain. Not financial advice. Only mention symbols that appear in the snapshot. Reply as JSON: {\"reply\":\"plain text, under 160 words\",\"symbols\":[\"SYMBOL\"]}."
				}, {
					role: "user",
					content: `Snapshot of live launches (partial):\n${JSON.stringify(snapshot)}\n\nQuestion: ${prompt}`
				}]
			})
		});
		if (res.ok) {
			const raw = (await res.json()).choices?.[0]?.message?.content?.trim() || "";
			let reply = raw;
			let symbols = [];
			try {
				const parsed = JSON.parse(raw);
				if (parsed.reply) reply = parsed.reply;
				if (Array.isArray(parsed.symbols)) symbols = parsed.symbols.map(String);
			} catch {}
			const wanted = new Set(symbols.map((s) => s.toLowerCase()));
			const tokensMatch = tokens.filter((t) => wanted.has(t.symbol.toLowerCase())).slice(0, 4);
			return Response.json({
				reply,
				tokensMatch,
				timestamp: Date.now(),
				engine: "grok"
			});
		}
	} catch {}
	const local = heuristic(prompt, tokens);
	return Response.json({
		...local,
		timestamp: Date.now(),
		engine: "rules"
	});
} } } });
var cache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 25e3;
var Route$6 = createFileRoute("/api/dex")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const rawAddrs = url.searchParams.get("addrs") || url.searchParams.get("address") || "";
	const rawPools = url.searchParams.get("pools") || url.searchParams.get("pool") || "";
	const addrs = rawAddrs.split(",").map((a) => a.trim().toLowerCase()).filter((a) => /^0x[a-f0-9]{40}$/.test(a)).slice(0, 30);
	const pools = rawPools.split(",").map((a) => a.trim().toLowerCase()).filter((a) => /^0x[a-f0-9]{40}$/.test(a)).slice(0, 30);
	if (addrs.length === 0 && pools.length === 0) return Response.json([]);
	const key = `${addrs.sort().join(",")}|${pools.sort().join(",")}`;
	const hit = cache.get(key);
	if (hit && Date.now() - hit.at < CACHE_TTL_MS) return Response.json(hit.body);
	const pairResults = [];
	const seenTokens = /* @__PURE__ */ new Set();
	if (addrs.length > 0) try {
		const res = await fetch(`https://api.dexscreener.com/tokens/v1/bsc/${addrs.join(",")}`, { headers: {
			accept: "application/json",
			"user-agent": "AgentBREW/1.0"
		} });
		if (res.ok) {
			const body = await res.json();
			if (Array.isArray(body)) for (const p of body) {
				pairResults.push({
					...p,
					_provider: "dexscreener"
				});
				const base = (p.baseToken?.address || "").toLowerCase();
				const quote = (p.quoteToken?.address || "").toLowerCase();
				if (base) seenTokens.add(base);
				if (quote) seenTokens.add(quote);
			}
		}
	} catch {}
	const missingFromAddrs = addrs.filter((a) => !seenTokens.has(a));
	if (pools.length > 0) try {
		const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/bsc/${pools.join(",")}`, { headers: {
			accept: "application/json",
			"user-agent": "AgentBREW/1.0"
		} });
		if (res.ok) {
			const body = await res.json();
			const pairs = Array.isArray(body?.pairs) ? body.pairs : Array.isArray(body) ? body : [];
			for (const p of pairs) {
				pairResults.push({
					...p,
					_provider: "dexscreener_pool"
				});
				const base = (p.baseToken?.address || "").toLowerCase();
				const quote = (p.quoteToken?.address || "").toLowerCase();
				if (base) seenTokens.add(base);
				if (quote) seenTokens.add(quote);
			}
		}
	} catch {}
	const stillMissing = missingFromAddrs.filter((a) => !seenTokens.has(a));
	if (stillMissing.length > 0) try {
		const geckoRes = await fetch(`https://api.geckoterminal.com/api/v2/networks/bsc/tokens/multi/${stillMissing.join(",")}`, { headers: {
			accept: "application/json",
			"user-agent": "AgentBREW/1.0"
		} });
		if (geckoRes.ok) {
			const geckoData = await geckoRes.json();
			const rows = Array.isArray(geckoData?.data) ? geckoData.data : [];
			for (const row of rows) {
				const attr = row?.attributes || {};
				const tAddr = String(attr.address || row.id || "").toLowerCase().replace(/^bsc_/, "");
				if (!tAddr) continue;
				const priceUsd = attr.price_usd != null ? String(attr.price_usd) : "0";
				const fdv = parseFloat(attr.fdv_usd || "0");
				const mcap = parseFloat(attr.market_cap_usd || attr.fdv_usd || "0");
				const vol = parseFloat(attr.volume_usd?.h24 || "0");
				const liq = parseFloat(attr.total_reserve_in_usd || "0");
				pairResults.push({
					chainId: "bsc",
					dexId: "coingecko_geckoterminal",
					url: `https://www.geckoterminal.com/bsc/tokens/${tAddr}`,
					pairAddress: "",
					baseToken: {
						address: tAddr,
						name: attr.name || "",
						symbol: attr.symbol || ""
					},
					quoteToken: {
						address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
						name: "Wrapped BNB",
						symbol: "WBNB"
					},
					priceNative: "0",
					priceUsd,
					txns: { h24: {
						buys: 0,
						sells: 0
					} },
					volume: { h24: vol },
					priceChange: { h24: 0 },
					liquidity: { usd: liq },
					fdv,
					marketCap: mcap,
					info: { imageUrl: attr.image_url || void 0 },
					_provider: "coingecko"
				});
				seenTokens.add(tAddr);
			}
		}
	} catch {}
	cache.set(key, {
		at: Date.now(),
		body: pairResults
	});
	return Response.json(pairResults);
} } } });
var Route$5 = createFileRoute("/api/inspect")({ server: { handlers: { GET: async ({ request }) => {
	const address = (new URL(request.url).searchParams.get("address") || "").trim().toLowerCase();
	if (!/^0x[a-f0-9]{40}$/.test(address)) return Response.json({ error: "Missing address" }, { status: 400 });
	const [dex, sec, gecko, val] = await Promise.allSettled([
		fetch(`https://api.dexscreener.com/tokens/v1/bsc/${address}`, { headers: {
			accept: "application/json",
			"user-agent": "AgentBREW/1.0"
		} }).then((r) => r.ok ? r.json() : null),
		fetch(`https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=${address}`).then((r) => r.ok ? r.json() : null),
		fetch(`https://api.geckoterminal.com/api/v2/networks/bsc/tokens/multi/${address}`, { headers: {
			accept: "application/json",
			"user-agent": "AgentBREW/1.0"
		} }).then((r) => r.ok ? r.json() : null),
		fetch(`https://brew.family/api/shared/launches/valuations?addresses=${address}`, { headers: {
			accept: "application/json",
			"user-agent": "AgentBREW/1.0"
		} }).then((r) => r.ok ? r.json() : null)
	]);
	const pairs = dex.status === "fulfilled" && Array.isArray(dex.value) ? dex.value : [];
	const security = sec.status === "fulfilled" ? sec.value?.result?.[address] ?? null : null;
	const geckoToken = gecko.status === "fulfilled" && Array.isArray(gecko.value?.data) && gecko.value.data.length > 0 ? gecko.value.data[0]?.attributes ?? null : null;
	const valuation = val.status === "fulfilled" && Array.isArray(val.value?.valuations) && val.value.valuations.length > 0 ? val.value.valuations[0] ?? null : null;
	return Response.json({
		address,
		pair: pairs[0] ?? null,
		pairs,
		security,
		coingecko: geckoToken,
		valuation
	});
} } } });
var Route$4 = createFileRoute("/api/search")({ server: { handlers: { GET: async ({ request }) => {
	const q = new URL(request.url).searchParams.get("q") || "";
	try {
		const result = await searchTokens(q);
		return Response.json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Search failed";
		return Response.json({
			error: message,
			tokens: [],
			count: 0
		}, { status: 500 });
	}
} } } });
var Route$3 = createFileRoute("/api/tokens")({ server: { handlers: { GET: async ({ request }) => {
	const force = new URL(request.url).searchParams.get("force") === "true";
	try {
		const payload = await getTokensPayload(force);
		return Response.json(payload, { headers: { "cache-control": "public, max-age=15" } });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Feed unavailable";
		return Response.json({
			error: message,
			tokens: []
		}, { status: 502 });
	}
} } } });
var PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1c140f"/><circle cx="32" cy="32" r="10" fill="#d97706"/></svg>`;
function imageFromDataUri(raw) {
	if (!raw.startsWith("data:image")) return null;
	const comma = raw.indexOf(",");
	if (comma < 0) return null;
	const meta = raw.slice(5, comma);
	const body = raw.slice(comma + 1);
	const mime = meta.split(";")[0] || "image/png";
	if (meta.includes(";base64")) {
		const bytes = Buffer.from(body, "base64");
		return new Response(bytes, { headers: {
			"content-type": mime,
			"cache-control": "public, max-age=86400"
		} });
	}
	return new Response(decodeURIComponent(body), { headers: {
		"content-type": mime,
		"cache-control": "public, max-age=86400"
	} });
}
var Route$2 = createFileRoute("/api/artwork/$address")({ server: { handlers: { GET: async ({ params }) => {
	const addr = String(params.address || "").toLowerCase().replace(/[^0-9a-fx]/g, "");
	if (!/^0x[a-f0-9]{40}$/.test(addr)) return new Response("Missing artwork address", { status: 400 });
	try {
		const upstream = await fetch(`https://brew.family/api/shared/artwork/${addr}`, { headers: { accept: "application/json, image/*, */*" } });
		if (!upstream.ok) return new Response(PLACEHOLDER, { headers: {
			"content-type": "image/svg+xml",
			"cache-control": "public, max-age=300"
		} });
		const contentType = upstream.headers.get("content-type") || "";
		if (contentType.includes("image/") || contentType.includes("svg")) {
			const buf = await upstream.arrayBuffer();
			return new Response(buf, { headers: {
				"content-type": contentType.split(";")[0] || "image/png",
				"cache-control": "public, max-age=86400"
			} });
		}
		const text = await upstream.text();
		if (text.trim().startsWith("<svg")) return new Response(text, { headers: {
			"content-type": "image/svg+xml",
			"cache-control": "public, max-age=86400"
		} });
		try {
			const data = JSON.parse(text);
			const raw = data.image || data.artwork || data.svg || "";
			const decoded = imageFromDataUri(raw);
			if (decoded) return decoded;
			if (raw.startsWith("<svg")) return new Response(raw, { headers: {
				"content-type": "image/svg+xml",
				"cache-control": "public, max-age=86400"
			} });
		} catch {}
		return new Response(PLACEHOLDER, { headers: {
			"content-type": "image/svg+xml",
			"cache-control": "public, max-age=300"
		} });
	} catch {
		return new Response(PLACEHOLDER, { headers: {
			"content-type": "image/svg+xml",
			"cache-control": "public, max-age=60"
		} });
	}
} } } });
var sessions = /* @__PURE__ */ new Map();
var known = /* @__PURE__ */ new Set();
var totalVisits = 0;
var ACTIVE_MS = 45e3;
function prune(now) {
	for (const [id, seen] of sessions) if (now - seen > ACTIVE_MS) sessions.delete(id);
}
function pingVisitor(sessionId) {
	const id = sessionId.slice(0, 80) || "anon";
	const now = Date.now();
	if (!known.has(id)) {
		known.add(id);
		totalVisits += 1;
	}
	sessions.set(id, now);
	prune(now);
	return {
		activeVisitors: Math.max(1, sessions.size),
		totalVisits,
		uniqueVisitors: known.size
	};
}
function leaveVisitor(sessionId) {
	if (sessionId) sessions.delete(sessionId.slice(0, 80));
	prune(Date.now());
	return {
		activeVisitors: Math.max(0, sessions.size),
		totalVisits,
		uniqueVisitors: known.size
	};
}
var Route$1 = createFileRoute("/api/visitors/leave")({ server: { handlers: { POST: async ({ request }) => {
	let sessionId = "";
	try {
		const raw = await request.text();
		const body = JSON.parse(raw);
		sessionId = String(body?.sessionId || "");
	} catch {
		sessionId = "";
	}
	return Response.json(leaveVisitor(sessionId));
} } } });
var Route = createFileRoute("/api/visitors/ping")({ server: { handlers: { POST: async ({ request }) => {
	let sessionId = "";
	try {
		const body = await request.json();
		sessionId = String(body?.sessionId || "");
	} catch {
		sessionId = "";
	}
	return Response.json(pingVisitor(sessionId));
} } } });
var rootRouteChildren = {
	IndexRoute: Route$9.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$10
	}),
	ApiCoingeckoRoute: Route$8.update({
		id: "/api/coingecko",
		path: "/api/coingecko",
		getParentRoute: () => Route$10
	}),
	ApiCopilotRoute: Route$7.update({
		id: "/api/copilot",
		path: "/api/copilot",
		getParentRoute: () => Route$10
	}),
	ApiDexRoute: Route$6.update({
		id: "/api/dex",
		path: "/api/dex",
		getParentRoute: () => Route$10
	}),
	ApiInspectRoute: Route$5.update({
		id: "/api/inspect",
		path: "/api/inspect",
		getParentRoute: () => Route$10
	}),
	ApiSearchRoute: Route$4.update({
		id: "/api/search",
		path: "/api/search",
		getParentRoute: () => Route$10
	}),
	ApiTokensRoute: Route$3.update({
		id: "/api/tokens",
		path: "/api/tokens",
		getParentRoute: () => Route$10
	}),
	ApiArtworkAddressRoute: Route$2.update({
		id: "/api/artwork/$address",
		path: "/api/artwork/$address",
		getParentRoute: () => Route$10
	}),
	ApiVisitorsLeaveRoute: Route$1.update({
		id: "/api/visitors/leave",
		path: "/api/visitors/leave",
		getParentRoute: () => Route$10
	}),
	ApiVisitorsPingRoute: Route.update({
		id: "/api/visitors/ping",
		path: "/api/visitors/ping",
		getParentRoute: () => Route$10
	})
};
var routeTree = Route$10._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { getRouter, router_BN7PA8_C_exports as t };
