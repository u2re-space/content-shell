import type { ShellId, ShellLayoutConfig } from "shells/types";
import { ImmersiveShell } from "shells/immersive/index";

// @ts-ignore — bundled as literal CSS for shadow root
import immersiveStyle from "../../immersive-shell/src/base.scss?inline";
// @ts-ignore
import contentOverrides from "./content-overrides.scss?inline";

/**
 * Content shell: CRX / content-script host.
 * Chromeless like ImmersiveShell, but allows multi-view routing like window/content-script UX.
 * INVARIANT: `cw-shell-content` and in-shadow chrome use `pointer-events: none`; only slotted views,
 * overlay-layer children, and document-level toasts/context UI opt into hits.
 *
 * Layers (shadow): no `underlying` slot — only default content + `overlay` (see {@link SHELL_SLOT}).
 * Optional host flag `data-content-views="hidden"` hides routed views until a tool sets `"visible"` (e.g. snipping).
 */
export class ContentShell extends ImmersiveShell {
    layout: ShellLayoutConfig = {
        hasSidebar: false,
        hasToolbar: false,
        hasTabs: false,
        supportsMultiView: true,
        supportsWindowing: true
    };

    id: ShellId = "content";
    name = "Content";

    /** INVARIANT: Over page content only — no wallpaper/canvas `underlying` layer. */
    protected includeUnderlyingSlot(): boolean {
        return false;
    }

    protected getStylesheet(): string | null {
        return `${immersiveStyle}${contentOverrides}`;
    }

    protected renderView(element: HTMLElement): void {
        super.renderView(element);
        element.style.pointerEvents = "auto";
    }

    async mount(container: HTMLElement): Promise<void> {
        await super.mount(container);
        const root = this.rootElement;
        if (root) {
            root.style.pointerEvents = "none";
        }
        const viewport = root?.shadowRoot?.querySelector(".app-shell__viewport") as HTMLElement | null;
        if (viewport) {
            viewport.style.pointerEvents = "none";
        }
        if (this.contentContainer) {
            this.contentContainer.style.pointerEvents = "none";
        }
        if (this.overlayContainer) {
            this.overlayContainer.style.pointerEvents = "none";
        }
    }
}

export function createShell(_container: HTMLElement): ContentShell {
    return new ContentShell();
}

export default createShell;
