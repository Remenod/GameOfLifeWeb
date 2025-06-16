import { parse_field } from "../pkg/game_of_life.js";
import { updateImageRendering } from "./canvas.js";

export const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");
const previewCellSize = 5;

export function updatePreviewCanvas() {
    const w = parseInt(document.getElementById("widthInput").value, 10);
    const h = parseInt(document.getElementById("heightInput").value, 10);

    updateImageRendering(previewCanvas, 10, w, h);

    const text = parse_field(document.getElementById("fieldInput").value, w);
    drawPreviewCanvas(text, w, h);
}

function drawPreviewCanvas(text, width, height) {
    previewCanvas.width = width * previewCellSize;
    previewCanvas.height = height * previewCellSize;

    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const ch = idx < text.length ? text[idx] : '0';
            previewCtx.fillStyle = ch === '1' ? "black" : "white";
            previewCtx.fillRect(x * previewCellSize, y * previewCellSize, previewCellSize, previewCellSize);
            previewCtx.strokeStyle = "#ccc";
            previewCtx.strokeRect(x * previewCellSize, y * previewCellSize, previewCellSize, previewCellSize);
        }
    }

}

