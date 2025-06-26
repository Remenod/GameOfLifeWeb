import { showToast } from "./utils.js";
import { drawCanvas, addCanvasListeners } from "./canvas.js";
import { WasmGame, parse_field, encode_field } from "../pkg/game_of_life.js";

export let game;
export let playing = false;
let width, height;
let lastTickTime = 0;
let loopAbort = false;

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

    game = new WasmGame(width, height, parse_field(fieldInput, width), rule, neighboursRuleInput, document.getElementById("alt-switch").checked);
    drawCanvas();
    addCanvasListeners();

    document.querySelectorAll('.controls.card button, .controls.card input')
        .forEach(el => el.disabled = false);
}

export function togglePlay(disableTickBtn = true) {
    const btn = document.getElementById("playPauseBtn");

    if (!playing) {
        const tps = parseInt(document.getElementById("tps").value, 10);
        if (isNaN(tps) || tps < 0) {
            return;
        }

        const tickInterval = (1000 / tps) ?? 100000000;
        lastTickTime = performance.now();
        loopAbort = false;

        function loop() {
            if (loopAbort) return;

            const now = performance.now();
            while (now - lastTickTime >= tickInterval) {
                tick();
                lastTickTime += tickInterval;
            }

            setTimeout(loop, 0);
        }

        loop();

        btn.textContent = "Pause";
        playing = true;
    } else {
        loopAbort = true;
        btn.textContent = "Play";
        playing = false;
    }
    if (disableTickBtn)
        document.getElementById('tickBtn').disabled = playing;
}

function clearGrid() {
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

function tick() {
    game.tick();
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

document.getElementById("v1copyBtn").addEventListener("click", () => copyField("v1"))
document.getElementById("v2copyBtn").addEventListener("click", () => copyField("v2", f => encode_field(f, false)))
document.getElementById("v3copyBtn").addEventListener("click", () => copyField("v3", f => encode_field(f, true)))

document.getElementById("tickBtn").addEventListener("click", tick)
document.getElementById("clearBtn").addEventListener("click", clearGrid)
document.getElementById("playPauseBtn").addEventListener("click", togglePlay)

document.getElementById("tps").addEventListener("input", () => {
    if (playing) {
        togglePlay(false);
        togglePlay(false);
    }
});
