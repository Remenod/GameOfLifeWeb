import { setNeighborMask, getNeighborMask, defMask } from "./form.js";
import { decode_field, encode_field } from "../pkg/game_of_life.js";

let wasmIsReady = false;
let wasmReadyResolvers: ((value?: void) => void)[] = [];

const widthInputEl = (document.getElementById("widthInput") as HTMLInputElement);
const heightInputEl = (document.getElementById("heightInput") as HTMLInputElement);
const ruleInputEl = (document.getElementById("ruleInput") as HTMLInputElement);
const fieldInputEl = (document.getElementById("fieldInput") as HTMLInputElement);

export function setWasmReady() {
    wasmIsReady = true;
    wasmReadyResolvers.forEach(fn => fn());
    wasmReadyResolvers = [];
}

async function waitForWasm(): Promise<void> {
    if (wasmIsReady) return;
    await new Promise<void>(resolve => wasmReadyResolvers.push(resolve));
}

export async function updateUrlParams() {
    await waitForWasm();
    const width = widthInputEl.value;
    const height = heightInputEl.value;
    const rule = ruleInputEl.value;
    const field = fieldInputEl.value;
    const mask = getNeighborMask().join("");

    const params = new URLSearchParams();

    if (width) params.set("w", width);
    if (height) params.set("h", height);
    if (rule) params.set("r", rule.replace("/", "."));
    if (mask) params.set("m", mask == defMask ? "d" : encode_field(mask, true));
    if (field) params.set("f", field.replace(/\[/g, '-').replace(/\]/g, '_').replace(";", '.'));

    const newUrl = `${location.pathname}?${params.toString()}`;
    history.replaceState(null, "", newUrl);
}

export function loadFromUrlParams() {
    const params = new URLSearchParams(window.location.search);

    const width = params.get("w");
    const height = params.get("h");
    const rule = params.get("r");
    const field = params.get("f");
    const mask = params.get("m");

    if (width) widthInputEl.value = width;
    if (height) heightInputEl.value = height;
    if (rule) ruleInputEl.value = rule.replace(".", "/");
    if (field) fieldInputEl.value = field.replace(/-/g, '[').replace(/_/g, "]").replace(".", ";");
    if (mask) setNeighborMask(mask == "d" ? defMask : decode_field(mask, true));
}

export function enforceDisabledControls() {
    (document.querySelectorAll('.controls.card button, .controls.card input') as NodeListOf<HTMLInputElement | HTMLButtonElement>)
        .forEach(el => el.disabled = true);
}

export function showToast(message: string, duration = 1500) {
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

export function resetElementValue(elementId: string, defaultValue = "") {
    const el = document.getElementById(elementId) as HTMLInputElement;
    if (el) {
        el.value = defaultValue;

        const event = new Event("input", { bubbles: true });
        el.dispatchEvent(event);
    }

}
