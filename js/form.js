import { updateUrlParams, showToast } from "./utils.js";
import { drawPreviewCanvas } from "./canvas.js";
import { playing, togglePlay, runGame } from "./game.js";

export function copyUrl() {
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

const cells = document.querySelectorAll("#neighborMaskSelector > div");
const blackIndices = [6, 7, 8, 11, 13, 16, 17, 18];

export function resetNeighborMask() {
    cells.forEach((cell, index) => {
        cell.style.background = blackIndices.includes(index) ? "black" : "white";
    });
}

document.getElementById("pasteBtn").addEventListener("click", async () => {
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

        const el = document.getElementById('fieldInput');
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

document.getElementById("fieldInput").addEventListener("input", () => { drawPreviewCanvas(), updateUrlParams() });
document.getElementById("widthInput").addEventListener("input", () => { drawPreviewCanvas(), updateUrlParams() });
document.getElementById("heightInput").addEventListener("input", () => { drawPreviewCanvas(), updateUrlParams() });
document.getElementById("ruleInput").addEventListener("input", updateUrlParams);

document.getElementById("copyUrl").addEventListener("click", copyUrl);

document.getElementById("settingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (playing) {
        togglePlay();
    }

    const widthInput = document.getElementById("widthInput").value;
    const heightInput = document.getElementById("heightInput").value;
    const ruleInput = document.getElementById("ruleInput").value;
    const fieldInput = document.getElementById("fieldInput").value;

    const mask = new Uint8Array(cells.length);

    cells.forEach((cell, i) => {
        const color = getComputedStyle(cell).backgroundColor;
        mask[i] = (color === "rgb(0, 0, 0)") ? 1 : 0;
    });

    await runGame(widthInput, heightInput, ruleInput, fieldInput, mask);
});

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const color = getComputedStyle(cell).backgroundColor;
        cell.style.backgroundColor = (color === "rgb(0, 0, 0)") ? "white" : "black";
    });
});
