import { updateUrlParams, showToast } from "./utils.js";
import { updatePreviewCanvas } from "./preview-canvas.js";
import { playing, togglePlay, runGame } from "./game.js";

export function copyUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
        .then(() => {
            console.log("URL copied to clipboard:", url);
        })
        .catch(err => {
            console.error("Failed to copy URL:", err);
        });
}

export async function pasteTemplate() {
    try {
        const text = await navigator.clipboard.readText().trim();

        const isValid =
            /^v([123])w(\d+);.*$/.test(text) ||
            /^[01\s\r\n]+$/.test(text);

        if (!isValid) {
            showToast('Invalid template format. Expecting v1/v2/v3wN;* or only 0/1.');
            return;
        }

        document.getElementById('fieldInput').value = text;
    } catch (err) {
        showToast('Unable to paste. Allow access to the clipboard.');
        console.error(err);
    }
}

document.getElementById("fieldInput").addEventListener("input", () => { updatePreviewCanvas(), updateUrlParams() });
document.getElementById("widthInput").addEventListener("input", () => { updatePreviewCanvas(), updateUrlParams() });
document.getElementById("heightInput").addEventListener("input", () => { updatePreviewCanvas(), updateUrlParams() });
document.getElementById("ruleInput").addEventListener("input", updateUrlParams);

document.getElementById("settingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (playing) {
        togglePlay();
    }

    const widthInput = document.getElementById("widthInput").value;
    const heightInput = document.getElementById("heightInput").value;
    const ruleInput = document.getElementById("ruleInput").value;
    const fieldInput = document.getElementById("fieldInput").value || "";

    await runGame(widthInput, heightInput, ruleInput, fieldInput);
});

