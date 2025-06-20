import { showToast } from "./utils.js";
import { drawCanvas } from "./canvas.js";
import { WasmGame, parse_field, encode_field } from "../pkg/game_of_life.js";

export let game;
export let playing = false;
let width, height;
let autoTickInterval = null;

const ruleRegex = /^B[0-8]*\/S[0-8]*$/;

export async function runGame(widthInput, heightInput, ruleInput, fieldInput, neighboursRuleInput = [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1]) {

    width = parseInt(widthInput);
    height = parseInt(heightInput);
    const rule = ruleInput.trim();

    if (!ruleRegex.test(rule)) {
        showToast("The rule isn't correct");
        const ruleInputEl = document.getElementById('ruleInput');
        ruleInputEl.classList.remove('flash-red');
        void ruleInputEl.offsetWidth;
        ruleInputEl.classList.add('flash-red');
        return;
    }

    game = new WasmGame(width, height, parse_field(fieldInput, width), rule, neighboursRuleInput);
    drawCanvas();

    document.querySelectorAll('.controls.card button, .controls.card input')
        .forEach(el => el.disabled = false);
}

export function togglePlay(disableTickBtn = true) {
    const btn = document.getElementById("playPauseBtn");

    if (!playing) {
        const tps = parseInt(document.getElementById("tps").value, 10) ?? 0;
        if (isNaN(tps) || tps < 0) {
            return;
        }

        autoTickInterval = setInterval(tick, (1000 / tps) ?? 0);

        btn.textContent = "Pause";
        playing = true;
    } else {
        clearInterval(autoTickInterval);
        btn.textContent = "Play";
        playing = false;
    }
    if (disableTickBtn)
        document.getElementById('tickBtn').disabled = playing;
}

export function clearGrid() {
    if (playing) {
        togglePlay();
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            game.set_cell(x, y, false);
        }
    }
    drawCanvas();
}

function copyField(version, encoder = null) {
    if (!game) return;

    let rawField = game.export_field();
    let field = encoder ? encoder(rawField) : rawField;
    let result = `${version}w${width};${field}`;

    navigator.clipboard.writeText(result)
        .then(() => showToast(`The ${version} template is copied.`))
        .catch(err => console.error("A copying error:", err));
}

export function copyField_v1() {
    copyField("v1");
}

export function copyField_v2() {
    copyField("v2", f => encode_field(f, false));
}

export function copyField_v3() {
    copyField("v3", f => encode_field(f, true));
}

export function tick() {
    game.tick();
    drawCanvas();
}

document.getElementById("tps").addEventListener("input", () => {
    if (playing) {
        togglePlay(false);
        togglePlay(false);
    }
});
