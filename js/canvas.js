import { BoundedSetQueue, parse_field } from "../pkg/game_of_life.js";
import { game } from "./game.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cellSize = 10;
const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");
const previewCellSize = 5;
const lineWidth = 1;
let isDragging = false;
let toggledCells;
export async function initToggledCellsCollection() {
    toggledCells = new BoundedSetQueue(20);
}
export function drawCanvas() {
    const width = game.get_width();
    const height = game.get_height();
    drawGenericCanvas(canvas, ctx, cellSize, width, height, 25, (x, y) => game.get_cell(x, y));
}
export function drawPreviewCanvas() {
    const width = parseInt(document.getElementById("widthInput").value, 10);
    const height = parseInt(document.getElementById("heightInput").value, 10);
    const fld = parse_field(document.getElementById("fieldInput").value.trim(), width);
    drawGenericCanvas(previewCanvas, previewCtx, previewCellSize, width, height, 10, (x, y) => {
        const idx = y * width + x;
        return idx < fld.length ? fld[idx] === 1 : false;
    });
}
function drawGenericCanvas(canv, canvCtx, cellSize, width, height, pixelatedThreshold, getData) {
    updateImageRendering(canv, pixelatedThreshold, width, height);
    canv.width = width * cellSize + lineWidth;
    canv.height = height * cellSize + lineWidth;
    canvCtx.clearRect(0, 0, canv.width, canv.height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            canvCtx.fillStyle = getData(x, y) ? "black" : "white";
            canvCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
    // lines
    canvCtx.strokeStyle = "#ddd";
    canvCtx.lineWidth = lineWidth;
    for (let x = 0; x <= width; x++) {
        canvCtx.beginPath();
        canvCtx.moveTo(x * cellSize + 0.5, 0);
        canvCtx.lineTo(x * cellSize + 0.5, height * cellSize + lineWidth);
        canvCtx.stroke();
    }
    for (let y = 0; y <= height; y++) {
        canvCtx.beginPath();
        canvCtx.moveTo(0, y * cellSize + 0.5);
        canvCtx.lineTo(width * cellSize + lineWidth, y * cellSize + 0.5);
        canvCtx.stroke();
    }
}
function updateImageRendering(canv = canvas, pixelatedThreshold, width, height) {
    const cellWidthPx = canv.clientWidth / width;
    const cellHeightPx = canv.clientHeight / height;
    if (cellWidthPx >= pixelatedThreshold || cellHeightPx >= pixelatedThreshold) {
        canv.style.imageRendering = 'pixelated';
    }
    else {
        canv.style.imageRendering = 'auto';
    }
}
function getCanvasCoords(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if ("touches" in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    }
    else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    const x = Math.floor((clientX - rect.left) * scaleX / cellSize);
    const y = Math.floor((clientY - rect.top) * scaleY / cellSize);
    return { x, y };
}
function toggleCellAtEvent(event) {
    const { x, y } = getCanvasCoords(event);
    const key = `${x},${y}`;
    if (x >= 0 && x < game.get_width() && y >= 0 && y < game.get_height() && !toggledCells.has(key)) {
        const alive = game.get_cell(x, y);
        game.set_cell(x, y, !alive);
        toggledCells.add(key);
        drawCanvas();
    }
}
export function addCanvasListeners() {
    canvas.addEventListener("mousedown", (event) => {
        isDragging = true;
        toggledCells.clear();
        toggleCellAtEvent(event);
    });
    canvas.addEventListener("mousemove", (event) => {
        if (isDragging)
            toggleCellAtEvent(event);
    });
    canvas.addEventListener("mouseup", () => {
        isDragging = false;
        toggledCells.clear();
    });
    canvas.addEventListener("mouseleave", () => {
        isDragging = false;
        toggledCells.clear();
    });
    canvas.addEventListener("touchstart", (event) => {
        event.preventDefault();
        isDragging = true;
        toggledCells.clear();
        toggleCellAtEvent(event);
    }, { passive: false });
    canvas.addEventListener("touchmove", (event) => {
        event.preventDefault();
        if (isDragging)
            toggleCellAtEvent(event);
    }, { passive: false });
    canvas.addEventListener("touchend", () => {
        isDragging = false;
        toggledCells.clear();
    });
    canvas.addEventListener("touchcancel", () => {
        isDragging = false;
        toggledCells.clear();
    });
}
