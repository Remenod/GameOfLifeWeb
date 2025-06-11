import init, { WasmGame } from "./pkg/game_of_life.js";

let game;
let playing = false;
let intervalId = null;
const cellSize = 10;
let width, height;

let canvas = document.getElementById("canvas");;
let ctx = canvas.getContext("2d");
const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");
const previewCellSize = 5;

window.tick = tick;
window.copyField = copyField;
window.togglePlay = togglePlay;
window.clearGrid = clearGrid;

let isDragging = false;
let toggledCells = new Set();

function clearGrid() {
    if (playing) {
        togglePlay();
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            game.set_cell(x, y, false);
        }
    }
    console.log("clear");
    drawGrid();
}

function togglePlay() {
    const btn = document.getElementById("playPauseBtn");

    if (!playing) {
        const tps = parseInt(document.getElementById("tps").value, 10);
        if (isNaN(tps) || tps <= 0) {
            alert("Enter the correct number of ticks per second.");
            return;
        }

        intervalId = setInterval(tick, 1000 / tps);

        btn.textContent = "Pause";
        playing = true;
    } else {
        clearInterval(intervalId);
        btn.textContent = "Play";
        playing = false;
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const alive = game.get_cell(x, y);
            ctx.fillStyle = alive ? "black" : "white";
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
    drawGridLines();
}

function drawGridLines() {
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize + 0.5, 0);
        ctx.lineTo(x * cellSize + 0.5, height * cellSize);
        ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize + 0.5);
        ctx.lineTo(width * cellSize, y * cellSize + 0.5);
        ctx.stroke();
    }
}

function drawPreviewField(text, width, height) {
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

function tick() {
    game.tick();
    drawGrid();
}

function copyField() {
    let result = game.export_field();

    navigator.clipboard.writeText(result)
        .then(() => alert("The field is copied to the clipboard."))
        .catch(err => console.error("A copying error:", err));
}

function toggleCellAtEvent(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    const key = `${x},${y}`;
    if (x >= 0 && x < width && y >= 0 && y < height && !toggledCells.has(key)) {
        const alive = game.get_cell(x, y);
        game.set_cell(x, y, !alive);
        toggledCells.add(key);
        drawGrid();
    }
}

async function runGame(widthInput, heightInput, ruleInput, fieldInput) {
    await init();

    width = parseInt(widthInput);
    height = parseInt(heightInput);
    const rule = ruleInput.trim();

    const cleaned = fieldInput.trim();

    let field = new Uint8Array(width * height);
    for (let i = 0; i < field.length; i++) {
        const ch = cleaned[i];
        field[i] = ch === "1" ? 1 : 0;
    }

    game = new WasmGame(width, height, field, rule);

    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    canvas.addEventListener("mousedown", (event) => {
        isDragging = true;
        toggledCells.clear();
        toggleCellAtEvent(event);
    });

    canvas.addEventListener("mousemove", (event) => {
        if (isDragging) {
            toggleCellAtEvent(event);
        }
    });

    canvas.addEventListener("mouseup", () => {
        isDragging = false;
        toggledCells.clear();
    });

    canvas.addEventListener("mouseleave", () => {
        isDragging = false;
        toggledCells.clear();
    });

    drawGrid();
}

function updatePreview() {
    const text = document.getElementById("fieldInput").value.trim();
    const w = parseInt(document.getElementById("widthInput").value, 10);
    const h = parseInt(document.getElementById("heightInput").value, 10);
    drawPreviewField(text, w, h);
}

updatePreview();

document.getElementById("fieldInput").addEventListener("input", updatePreview);
document.getElementById("widthInput").addEventListener("input", updatePreview);
document.getElementById("heightInput").addEventListener("input", updatePreview);
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
