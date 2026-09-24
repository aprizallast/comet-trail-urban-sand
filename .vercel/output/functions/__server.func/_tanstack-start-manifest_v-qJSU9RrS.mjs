//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-qJSU9RrS.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/app/applet/src/routes/__root.tsx",
		children: [
			"/",
			"/api/coingecko",
			"/api/copilot",
			"/api/dex",
			"/api/inspect",
			"/api/search",
			"/api/tokens",
			"/api/artwork/$address",
			"/api/visitors/leave",
			"/api/visitors/ping"
		],
		preloads: ["/assets/index-_xUk4EPU.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-_xUk4EPU.js"
		} }]
	},
	"/": {
		filePath: "/app/applet/src/routes/index.tsx",
		children: void 0,
		preloads: ["/assets/routes-CgE0W3YE.js"]
	}
} });
//#endregion
export { tsrStartManifest };
