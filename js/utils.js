import { marked } from 'https://cdn.jsdelivr.net/npm/marked/+esm';

export function updateUrlParams() {
    const width = document.getElementById("widthInput").value;
    const height = document.getElementById("heightInput").value;
    const rule = document.getElementById("ruleInput").value;
    const field = document.getElementById("fieldInput").value;

    const params = new URLSearchParams();

    if (width) params.set("w", width);
    if (height) params.set("h", height);
    if (rule) params.set("r", rule.replace("/", "."));
    if (field) params.set("f", field.replace(/\[/g, '-').replace(/\]/g, '_').replace(";", '.'));

    const newUrl = `${location.pathname}?${params.toString()}`;
    history.replaceState(null, "", newUrl);
}

export function loadFromUrlParams() {
    const params = new URLSearchParams(window.location.search);

    const width = params.get("w");
    const height = params.get("h");
    const rule = params.get("r");
    const field = params.get("f");

    if (width) document.getElementById("widthInput").value = width;
    if (height) document.getElementById("heightInput").value = height;
    if (rule) document.getElementById("ruleInput").value = rule.replace(".", "/");
    if (field) document.getElementById("fieldInput").value = field.replace(/-/g, '[').replace(/_/g, "]").replace(".", ";");
}

export function enforceDisabledControls() {
    document.querySelectorAll('.controls.card button, .controls.card input')
        .forEach(el => el.disabled = true);
}

export function showToast(message, duration = 1500) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

export function resetElementValue(elementId, defaultValue = "") {
    const el = document.getElementById(elementId);
    if (el) {
        el.value = defaultValue;

        const event = new Event("input", { bubbles: true });
        el.dispatchEvent(event);
    }

}

let helpContent = await loadHelpContent(['width', 'rule', 'height']);

export function openHelp(key, trigger) {
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

        trigger._tooltip = tooltip;

        setTimeout(() => { document.addEventListener("click", closeHelp); }, 0);
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
        document.getElementById("close-modal").addEventListener("click", closeHelp);

        setTimeout(() => { document.addEventListener("click", closeHelp); }, 0);
    }
}

function closeHelp() {
    document.querySelectorAll(".tooltip-box").forEach(e => e.remove());
    document.querySelectorAll(".modal-overlay").forEach(e => e.remove());
    document.removeEventListener("click", closeHelp);
}

async function loadHelpContent(keys) {
    const helpContent = {};
    for (const key of keys) {
        const response = await fetch(`help/${key}.md?nocache=${Date.now()}`);
        const mdText = await response.text();
        helpContent[key] = parseMarkdownHelp(mdText);
        console.log(helpContent[key]);
    }
    return helpContent;
}

function parseMarkdownHelp(md) {
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
    const html = marked.parse(markdownBody);

    return { type, html };
}

