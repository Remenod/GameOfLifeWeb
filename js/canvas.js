import { togglePlay, height, width, game, playing } from "./game.js";

const cellSize = 10;
let canvas = document.getElementById("canvas");;
let ctx = canvas.getContext("2d");

let isDragging = false;
let toggledCells = new Set();

export function clearGrid() {
    if (playing) {
        togglePlay();
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            game.set_cell(x, y, false);
        }
    }
    drawGrid();
}

export function drawGrid() {
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const alive = game.get_cell(x, y);
            ctx.fillStyle = alive ? "black" : "white";
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // grid lines
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

export function updateImageRendering() {
    const cellWidthPx = canvas.clientWidth / width;
    const cellHeightPx = canvas.clientHeight / height;

    const pixelatedThreshold = 25;

    if (cellWidthPx >= pixelatedThreshold || cellHeightPx >= pixelatedThreshold) {
        canvas.style.imageRendering = 'pixelated';
    } else {
        canvas.style.imageRendering = 'auto';
    }
}

function getCanvasCoords(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if (event.touches) {
        // TouchEvent
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        // MouseEvent
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
    if (x >= 0 && x < width && y >= 0 && y < height && !toggledCells.has(key)) {
        const alive = game.get_cell(x, y);
        game.set_cell(x, y, !alive);
        toggledCells.add(key);
        drawGrid();
    }
}

canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    toggledCells.clear();
    toggleCellAtEvent(event);
});

canvas.addEventListener("mousemove", (event) => {
    if (isDragging) toggleCellAtEvent(event);
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
    if (isDragging) toggleCellAtEvent(event);
}, { passive: false });

canvas.addEventListener("touchend", () => {
    isDragging = false;
    toggledCells.clear();
});

canvas.addEventListener("touchcancel", () => {
    isDragging = false;
    toggledCells.clear();
});

