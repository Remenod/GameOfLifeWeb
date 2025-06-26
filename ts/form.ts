import { drawPreviewCanvas } from "./canvas.js";
import { updateUrlParams, showToast, resetElementValue } from "./utils.js";
import { playing, togglePlay, runGame } from "./game.js";
// @ts-ignore
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/+esm';

const cells = document.querySelectorAll("#neighborMaskSelector > div") as NodeListOf<HTMLElement>;
export const defMask = "0000001110010100111000000";

type HelpEntry = {
    type: string;
    html: string;
};

function copyUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
        .then(() => {
            console.log("URL copied to clipboard:", url);
            showToast("URL copied to clipboard");
        })
        .catch(err => {
            console.error("Failed to copy URL:", err);
            showToast("Failed to copy URL");
        });
}

export function setNeighborMask(mask: string) {
    cells.forEach((cell, index) => {
        cell.style.background = mask[index] == '1' ? "black" : "white";
    });
}

export function getNeighborMask() {
    const mask = new Uint8Array(cells.length);

    cells.forEach((cell, i) => {
        const color = getComputedStyle(cell).backgroundColor;
        mask[i] = (color === "rgb(0, 0, 0)") ? 1 : 0;
    });
    return mask;
}

const helpContent = await loadHelpContent();

const modalCloseHandler = (e: MouseEvent) => {
    const modal = document.querySelector(".modal-content");
    if (modal && (!modal.contains(e.target as Node))) {
        closeHelp();
        document.removeEventListener("click", modalCloseHandler);
    }
};

function openHelp(key: string, trigger: HTMLElement) {
    const data = helpContent[key];
    if (!data) return;
    closeHelp();

    if (data.type === "tooltip") {
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip-box";
        tooltip.innerHTML = data.html;
        document.body.appendChild(tooltip);

        const rect = trigger.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.bottom + 6 + window.scrollY}px`;

        // @ts-expect-error
        trigger._tooltip = tooltip;

        setTimeout(() => {
            document.addEventListener("click", closeHelp);
        }, 0);
    }

    if (data.type === "modal") {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
            <div class="modal-content">
                <button class="close-btn" id="close-modal">×</button>
                <div id="helpContentContainer" class="markdown-content">
                    ${data.html}
                </div>
            </div>`;

        document.body.appendChild(overlay);

        const closeBtn = document.getElementById("close-modal");
        if (closeBtn) {
            closeBtn.addEventListener("click", closeHelp);
        }

        document.body.style.overflow = "hidden";

        setTimeout(() => {
            document.addEventListener("click", modalCloseHandler);
        }, 0);
    }
}

function closeHelp() {
    document.querySelectorAll(".tooltip-box").forEach(e => e.remove());
    document.querySelectorAll(".modal-overlay").forEach(e => e.remove());
    document.removeEventListener("click", closeHelp);
    document.removeEventListener("click", modalCloseHandler);
    document.body.style.overflow = '';
}

async function loadHelpContent() {
    const helpContent: Record<string, HelpEntry> = {};
    const response = await fetch(`help/index.json`); // ?nocache=${Date.now()}
    const keys = await response.json();

    for (const key of keys) {
        const mdRes = await fetch(`help/${key}.md`); // ?nocache=${Date.now()}
        const mdText = await mdRes.text();
        helpContent[key] = parseMarkdownHelp(mdText);
    }
    return helpContent;
}

function parseMarkdownHelp(md: string) {
    const lines = md.trim().split('\n');
    let type = 'modal'; // default
    let contentStart = 0;

    for (let i = 0; i < 3; i++) {
        if (lines[i]?.startsWith('type:')) {
            type = lines[i].split(':')[1].trim();
            contentStart = i + 1;
            break;
        }
    }

    const markdownBody = lines.slice(contentStart).join('\n');
    const html = marked.parse(markdownBody) as string;

    return { type, html };
}

(document.getElementById("pasteBtn") as HTMLElement).addEventListener("click", async () => {
    try {
        const rawText = await navigator.clipboard.readText();
        const text = rawText.trim();

        const isValid =
            /^v([123])w(\d+);.*$/.test(text) ||
            /^[01\s\r\n]+$/.test(text);

        if (!isValid) {
            showToast('Invalid template format. Expecting v1/v2/v3wN;* or only 0/1.');
            return;
        }

        const el = document.getElementById('fieldInput') as HTMLInputElement;
        if (el) {
            el.value = text;

            const event = new Event("input", { bubbles: true });
            el.dispatchEvent(event);
        }
    } catch (err) {
        showToast('Unable to paste. Allow access to the clipboard.');
        console.error(err);
    }
});

const change = () => { drawPreviewCanvas(), updateUrlParams() };

(document.getElementById("fieldInput") as HTMLElement).addEventListener("input", change);
(document.getElementById("widthInput") as HTMLElement).addEventListener("input", change);
(document.getElementById("heightInput") as HTMLElement).addEventListener("input", change);
(document.getElementById("ruleInput") as HTMLElement).addEventListener("input", updateUrlParams);

(document.getElementById("copyUrl") as HTMLElement).addEventListener("click", copyUrl);
(document.getElementById("resetNeighborMask") as HTMLElement).addEventListener("click", () => { setNeighborMask(defMask); updateUrlParams() });

(document.getElementById("settingsForm") as HTMLElement).addEventListener("submit", async (e) => {
    e.preventDefault();

    if (playing) {
        togglePlay();
    }

    const widthInput = parseInt((document.getElementById("widthInput") as HTMLInputElement).value);
    const heightInput = parseInt((document.getElementById("heightInput") as HTMLInputElement).value);
    const ruleInput = (document.getElementById("ruleInput") as HTMLInputElement).value;
    const fieldInput = (document.getElementById("fieldInput") as HTMLInputElement).value;

    const mask = getNeighborMask();

    await runGame(widthInput, heightInput, ruleInput, fieldInput, mask);
});

(document.querySelectorAll(".info-small") as NodeListOf<HTMLElement>).forEach(btn => {
    btn.addEventListener("click", () => {
        openHelp(btn.dataset.type ?? "", btn);
    });
});

(document.querySelectorAll(".resetBtn") as NodeListOf<HTMLElement>).forEach(btn => {
    btn.addEventListener("click", () => {
        resetElementValue(btn.dataset.element ?? "", btn.dataset.default);
    });
});

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const color = getComputedStyle(cell).backgroundColor;
        cell.style.backgroundColor = (color === "rgb(0, 0, 0)") ? "white" : "black";
        updateUrlParams();
    });
});
