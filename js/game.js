import { WasmGame, parse_field, encode_field } from "../pkg/game_of_life.js";
import { drawGrid } from "./canvas.js";

export let game;
export let width, height;
export let playing = false;
let intervalId = null;


export async function runGame(widthInput, heightInput, ruleInput, fieldInput) {
    width = parseInt(widthInput);
    height = parseInt(heightInput);
    const rule = ruleInput.trim();

    const text = parse_field(fieldInput, width);

    let field = new Uint8Array(width * height);
    for (let i = 0; i < field.length; i++) {
        const ch = text[i];
        field[i] = ch === "1" ? 1 : 0;
    }

    game = new WasmGame(width, height, field, rule);
    drawGrid();
}

export function togglePlay() {
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

function copyField(version, encoder = null) {
    if (!game) return;

    let rawField = game.export_field();
    let field = encoder ? encoder(rawField) : rawField;
    let result = `${version}w${width};${field}`;

    navigator.clipboard.writeText(result)
        .then(() => showToast(`The ${version} template is copied to the clipboard.`))
        .catch(err => console.error("A copying error:", err));
}

export function copyFieldV1() {
    copyField("v1");
}

export function copyFieldV2() {
    copyField("v2", f => encode_field(f, false));
}

export function copyFieldV3() {
    copyField("v3", f => encode_field(f, true));
}


function showToast(message, duration = 1500) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}



export function tick() {
    game.tick();
    drawGrid();
}

document.getElementById("tps").addEventListener("input", () => {
    if (playing) {
        togglePlay();
        togglePlay();
    }
});
