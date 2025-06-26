import { showToast } from "./utils.js";
import { drawCanvas, addCanvasListeners } from "./canvas.js";
import { WasmGame, parse_field, encode_field } from "../pkg/game_of_life.js";

export let game: WasmGame;
export let playing = false;
let width: number, height: number;
let tickCount = 0;
let lastTickTime = 0;
let loopAbort = false;
let tickStartTime = performance.now();

const ruleRegex = /^B[0-8]*\/S[0-8]*$/;
const ruleInputEl = document.getElementById('ruleInput') as HTMLInputElement;
const tpsDisplayEl = document.getElementById("tpsDisplay") as HTMLElement;
const altSwitch = document.getElementById("alt-switch") as HTMLInputElement;
const tpsInput = document.getElementById("tps") as HTMLInputElement;
const playPauseBtnEl = document.getElementById("playPauseBtn") as HTMLButtonElement;
const tickBtnEl = document.getElementById('tickBtn') as HTMLButtonElement;

export async function runGame(widthInput: number, heightInput: number, ruleInput: string, fieldInput: string, neighboursRuleInput: Uint8Array) {

    width = widthInput;
    height = heightInput;
    const rule = ruleInput.trim();

    if (!ruleRegex.test(rule)) {
        showToast("The rule isn't correct");
        ruleInputEl.classList.remove('flash-red');
        void ruleInputEl.offsetWidth;
        ruleInputEl.classList.add('flash-red');
        return;
    }

    game = new WasmGame(width, height, parse_field(fieldInput, width), rule, neighboursRuleInput, altSwitch.checked);
    drawCanvas();
    addCanvasListeners();
    tpsDisplayEl.style.opacity = "100";
    logTPS();

    (document.querySelectorAll('.controls.card button, .controls.card input') as NodeListOf<HTMLInputElement | HTMLButtonElement>)
        .forEach(el => el.disabled = false);
}

function logTPS() {
    const now = performance.now();
    const elapsed = now - tickStartTime;

    const tps = (elapsed > 0) ? tickCount / (elapsed / 1000) : tickCount;
    tpsDisplayEl.textContent = `TPS: ${isFinite(tps) ? tps.toFixed(1) : "?"}`;

    tickCount = 0;
    tickStartTime = now;

    setTimeout(logTPS, 1000);
}

export function togglePlay(disableTickBtn = true) {
    if (!playing) {
        const tps = parseInt(tpsInput.value, 10);
        if (isNaN(tps) || tps < 0) {
            return;
        }

        const tickInterval = 1000 / tps;
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

        playPauseBtnEl.textContent = "Pause";
        playing = true;
    } else {
        loopAbort = true;
        playPauseBtnEl.textContent = "Play";
        playing = false;
    }
    if (disableTickBtn)
        tickBtnEl.disabled = playing;
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
    tickCount++;
}

function copyField(version: string, encoder: ((input: string) => string) | null = null) {
    if (!game) return;

    let rawField = game.export_field();
    let field = encoder ? encoder(rawField) : rawField;
    let result = `${version}w${width};${field}`;

    navigator.clipboard.writeText(result)
        .then(() => showToast(`The ${version} template is copied.`))
        .catch(err => console.error("A copying error:", err));
}

(document.getElementById("v1copyBtn") as HTMLButtonElement).addEventListener("click", () => copyField("v1"));
(document.getElementById("v2copyBtn") as HTMLButtonElement).addEventListener("click", () => copyField("v2", f => encode_field(f, false)));
(document.getElementById("v3copyBtn") as HTMLButtonElement).addEventListener("click", () => copyField("v3", f => encode_field(f, true)));

tickBtnEl.addEventListener("click", tick);
playPauseBtnEl.addEventListener("click", () => togglePlay());
(document.getElementById("clearBtn") as HTMLButtonElement).addEventListener("click", clearGrid);

tpsInput.addEventListener("input", () => {
    if (playing) {
        togglePlay(false);
        togglePlay(false);
    }
});
