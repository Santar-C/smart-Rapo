import { IInputs, IOutputs } from "./generated/ManifestTypes";

const DEFAULT_URL = "https://santar-c.github.io/smart-Rapo/index.html";
const ALLOWED_HOST = "santar-c.github.io";

export class RapoEmbed implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private iframe!: HTMLIFrameElement;
    private currentUrl = "";

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        context.mode.trackContainerResize(true);

        this.iframe = document.createElement("iframe");
        this.iframe.style.border = "0";
        this.iframe.style.display = "block";
        this.iframe.style.width = "100%";
        this.iframe.style.height = "100%";
        // dock-scan.html needs the camera for QR scanning, checkin.html needs geolocation
        this.iframe.setAttribute("allow", "camera; geolocation; clipboard-write; fullscreen");

        container.style.width = "100%";
        container.style.height = "100%";
        container.appendChild(this.iframe);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const width = context.mode.allocatedWidth;
        const height = context.mode.allocatedHeight;
        if (width > 0) this.iframe.style.width = `${width}px`;
        if (height > 0) this.iframe.style.height = `${height}px`;

        const url = this.resolveUrl(context.parameters.sourceUrl.raw);
        if (url !== this.currentUrl) {
            this.currentUrl = url;
            this.iframe.src = url;
        }
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        this.iframe.src = "about:blank";
    }

    // Only the domain declared in the manifest may be loaded; anything else falls back to the home page.
    private resolveUrl(raw: string | null): string {
        const value = (raw ?? "").trim();
        if (!value) return DEFAULT_URL;
        try {
            const parsed = new URL(value);
            return parsed.protocol === "https:" && parsed.hostname === ALLOWED_HOST ? parsed.href : DEFAULT_URL;
        } catch {
            return DEFAULT_URL;
        }
    }
}
