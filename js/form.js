import { updateUrlParams } from "./utils.js";
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

