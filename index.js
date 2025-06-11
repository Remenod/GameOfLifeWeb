import init, { WasmGame } from "./pkg/game_of_life.js";

let game;
const grid = document.getElementById("grid");

window.tick = tick;
window.copyField = copyField;
window.togglePlay = togglePlay;

let playing = false;
let intervalId = null;

function togglePlay() {
    const btn = document.getElementById("playPauseBtn");

    if (!playing) {
        const tps = parseInt(document.getElementById("tps").value, 10);
        if (isNaN(tps) || tps <= 0) {
            alert("Enter the correct number of ticks per second.");
            return;
        }

        intervalId = setInterval(() => {
            tick();
        }, 1000 / tps);

        btn.textContent = "Pause";
        playing = true;
    } else {
        clearInterval(intervalId);
        btn.textContent = "Play";
        playing = false;
    }
}

function createGrid(width, height) {
    grid.innerHTML = "";
    grid.style.width = `${width * 10}px`;
    for (let y = 0; y < height; y++) {
        const row = document.createElement("div");
        for (let x = 0; x < width; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell", "dead");
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener("click", () => {
                const alive = game.get_cell(x, y);
                game.set_cell(x, y, !alive);
                drawGrid();
            });
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

function drawGrid() {
    for (let cell of grid.querySelectorAll(".cell")) {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const alive = game.get_cell(x, y);
        cell.classList.toggle("alive", alive);
        cell.classList.toggle("dead", !alive);
    }
}

function tick() {
    game.tick();
    drawGrid();
}

function copyField() {
    let result = game.export_field()

    navigator.clipboard.writeText(result)
        .then(() => alert("The field is copied to the clipboard."))
        .catch(err => console.error("A copying error:", err));
}

async function run() {
    await init();

    let width = parseInt(prompt("Enter width:", "100"));
    let height = parseInt(prompt("Enter height", "100"));
    let rule = prompt("Enter a rule (e.g., B3/S23):", "B3/S23");

    const input = prompt(`Enter a field of ${width * height} characters (0 or 1) without spaces or leave it blank:`, "");
    const cleaned = input ? input.trim() : "";

    let field = new Uint8Array(width * height);
    for (let i = 0; i < field.length; i++) {
        const ch = cleaned[i];
        field[i] = ch == "1" ? 1 : 0;
    }

    game = new WasmGame(width, height, field, rule);

    createGrid(width, height);
    drawGrid();
}

run();
