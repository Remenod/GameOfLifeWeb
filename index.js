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
window.copyUrl = copyUrl;
window.togglePlay = togglePlay;
window.clearGrid = clearGrid;

let isDragging = false;
let toggledCells = new Set();

loadFromUrlParams();

await init().then(() => {
    updatePreview();
});

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
    let result = "v2w" + width + ";" + WasmGame.encode_field(game.export_field());

    navigator.clipboard.writeText(result)
        .then(() => alert("The field is copied to the clipboard."))
        .catch(err => console.error("A copying error:", err));
}

function copyUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
        .then(() => {
            console.log("URL copied to clipboard:", url);
        })
        .catch(err => {
            console.error("Failed to copy URL:", err);
        });
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

function parseField(input, currentWidth) {
    const [header, data] = input.includes(";") ? input.trim().split(';') : ["v1w" + currentWidth, input];
    const match = header.match(/^v([12])w(\d+)$/);

    const version = match ? parseInt(match[1], 10) : 1;
    const width = match ? parseInt(match[2], 10) : currentWidth;

    const decoded = version === 2 ? WasmGame.decode_field(data) : data;
    const normalized = currentWidth == width ? decoded : WasmGame.adapt_field_width(decoded, width, currentWidth);

    return normalized;
}

async function runGame(widthInput, heightInput, ruleInput, fieldInput) {
    width = parseInt(widthInput);
    height = parseInt(heightInput);
    const rule = ruleInput.trim();

    const text = parseField(fieldInput, width);

    let field = new Uint8Array(width * height);
    for (let i = 0; i < field.length; i++) {
        const ch = text[i];
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
    const w = parseInt(document.getElementById("widthInput").value, 10);
    const h = parseInt(document.getElementById("heightInput").value, 10);

    const text = parseField(document.getElementById("fieldInput").value, w);
    drawPreviewField(text, w, h);

    updateUrlParams();
}

function updateUrlParams() {
    const width = document.getElementById("widthInput").value;
    const height = document.getElementById("heightInput").value;
    const rule = document.getElementById("ruleInput").value;
    const field = document.getElementById("fieldInput").value;

    const params = new URLSearchParams();

    if (width) params.set("w", width);
    if (height) params.set("h", height);
    if (rule) params.set("r", rule);
    if (field) params.set("f", field);

    const newUrl = `${location.pathname}?${params.toString()}`;
    history.replaceState(null, "", newUrl);
}

function loadFromUrlParams() {
    const params = new URLSearchParams(window.location.search);

    const width = params.get("w");
    const height = params.get("h");
    const rule = params.get("r");

    const rawField = params.get("f");
    const field = rawField !== null ? decodeURIComponent(rawField) : "";

    if (width) document.getElementById("widthInput").value = width;
    if (height) document.getElementById("heightInput").value = height;
    if (rule) document.getElementById("ruleInput").value = rule;
    if (field) document.getElementById("fieldInput").value = field;
}

document.getElementById("fieldInput").addEventListener("input", updatePreview);
document.getElementById("widthInput").addEventListener("input", updatePreview);
document.getElementById("heightInput").addEventListener("input", updatePreview);

document.getElementById("ruleInput").addEventListener("input", updateUrlParams);

document.getElementById("tps").addEventListener("input", () => {
    if (playing) {
        togglePlay();
        togglePlay();
    }
});
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
