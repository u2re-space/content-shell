/**
 * Content shell HTTPS demo (transparent overlay + host-page harness).
 * Default port 443 + `certs/cert.pem` + `certs/key.pem` via shared helper (falls back to @vitejs/plugin-basic-ssl).
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { getViewResolveAliases, workspaceRoot, viewsRoot } from "../../views/view-resolve-aliases.js";
import { tryLoadDevSslFromDir } from "../../views/shared/vite.view.config.js";

const pkgRoot = resolve(import.meta.dirname);
const crosswordFrontend = resolve(workspaceRoot, "apps/CrossWord/src/frontend");
const shellsRoot = resolve(workspaceRoot, "modules/shells");

function resolveDevServerPort() {
    const raw = process.env.VIEW_DEV_PORT;
    if (raw != null && String(raw).trim() !== "") {
        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? n : 443;
    }
    return 443;
}

const port = resolveDevServerPort();
const useHttps = process.env.VIEW_DEV_HTTP !== "1";
const projectSsl = tryLoadDevSslFromDir(pkgRoot, { sslDir: "certs" });
const plugins = useHttps ? (projectSsl !== null ? [] : [basicSsl()]) : [];
const serverHttps = !useHttps ? false : projectSsl !== null ? projectSsl : undefined;

const viteDevOrigin = (process.env.VITE_DEV_ORIGIN || "").trim();

const fsAllow = [
    searchForWorkspaceRoot(pkgRoot),
    workspaceRoot,
    viewsRoot,
    resolve(workspaceRoot, "modules/views"),
    shellsRoot
];
if (existsSync(crosswordFrontend)) fsAllow.push(crosswordFrontend);

export default defineConfig({
    root: pkgRoot,
    plugins,
    resolve: {
        alias: getViewResolveAliases(pkgRoot)
    },
    server: {
        host: "0.0.0.0",
        open: false,
        strictPort: process.env.VIEW_DEV_STRICT_PORT === "1",
        port,
        ...(viteDevOrigin ? { origin: viteDevOrigin } : {}),
        https: serverHttps,
        fs: {
            allow: fsAllow
        }
    },
    build: {
        target: "esnext",
        outDir: "dist",
        emptyOutDir: true,
        /* WHY: lightningcss minify fails on some Veela `::slotted` shapes (same as markdown-view). */
        cssMinify: false,
        rollupOptions: {
            input: resolve(pkgRoot, "index.html")
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true
            }
        }
    }
});
