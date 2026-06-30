/**
 * HTTPS demo: simulated host page (scrollable text + images) + transparent content shell + overlay harness.
 * Overlays (toast, modal, context menu) live outside the shell mount so they do not replace host DOM.
 */
import "./demo-host-theme.css";
import "fest/icon";
import { bootContent } from "boot/ts/BootLoader";
import { showToast } from "boot/ts/toast";
import { applyTheme, initTheme } from "core/utils/Theme";
import { loadSettings, saveSettings } from "com/config/Settings";

const app = document.querySelector<HTMLElement>("#app") ?? document.body;

void initTheme();

function wireDemoThemeToggle(): void {
    const btn = document.getElementById("demo-theme");
    if (!btn) return;

    const refreshLabel = (): void => {
        const s = loadSettings();
        const t = String((s.appearance as { theme?: string } | undefined)?.theme ?? "auto");
        btn.textContent = `Theme: ${t}`;
    };

    refreshLabel();

    btn.addEventListener("click", () => {
        const s = loadSettings();
        if (!s.appearance) s.appearance = {};
        const app = s.appearance as { theme?: string; fontSize?: string; color?: string };
        const cur = app.theme || "auto";
        const next = cur === "auto" ? "light" : cur === "light" ? "dark" : "auto";
        app.theme = next;
        saveSettings(s);
        applyTheme(s);
        btn.textContent = `Theme: ${next}`;
    });
}

function wireUnderlayInteractions(): void {
    const openModalBtn = document.getElementById("demo-open-modal");
    const toastBtn = document.getElementById("demo-toast");
    const ctxZone = document.getElementById("demo-context-zone");
    const modal = document.getElementById("demo-modal") as HTMLDialogElement | null;
    const modalClose = document.getElementById("demo-modal-close");

    toastBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        showToast({ message: "Toast from host page harness (not the shell)", duration: 2800, kind: "info" });
    });

    openModalBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        modal?.showModal();
    });

    modalClose?.addEventListener("click", () => modal?.close());

    modal?.addEventListener("click", (ev) => {
        const rect = modal.getBoundingClientRect();
        const inDialog =
            ev.clientX >= rect.left &&
            ev.clientX <= rect.right &&
            ev.clientY >= rect.top &&
            ev.clientY <= rect.bottom;
        if (!inDialog) modal.close();
    });

    const menu = document.getElementById("demo-context-menu");
    const hideMenu = () => {
        menu?.removeAttribute("data-open");
    };

    ctxZone?.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
        if (!menu) return;
        menu.style.left = `${ev.clientX}px`;
        menu.style.top = `${ev.clientY}px`;
        menu.setAttribute("data-open", "true");
    });

    document.addEventListener("click", hideMenu, true);
    document.addEventListener("scroll", hideMenu, true);

    menu?.querySelectorAll<HTMLButtonElement>("[data-demo-menu]").forEach((btn) => {
        btn.addEventListener("click", () => {
            hideMenu();
            showToast({ message: `Menu: ${btn.dataset.demoMenu ?? "action"}`, duration: 2000, kind: "success" });
        });
    });
}

wireUnderlayInteractions();
wireDemoThemeToggle();

/** Transparent shell only: no viewer/markdown-view; host page stays visible. */
void bootContent(app, "home", {
    rememberChoice: false,
    skipInitialNavigate: true,
    channels: []
}).catch((err) => {
    console.error(err);
    app.textContent = err instanceof Error ? err.message : String(err);
});
