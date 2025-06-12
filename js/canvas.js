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

export function toggleCellAtEvent(event) {
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
