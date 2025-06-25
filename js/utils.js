import { setNeighborMask, getNeighborMask, defMask } from "./form.js";
import { decode_field, encode_field } from "../pkg/game_of_life.js";

let wasmIsReady = false;
let wasmReadyResolvers = [];

export function setWasmReady() {
    wasmIsReady = true;
    wasmReadyResolvers.forEach(fn => fn());
    wasmReadyResolvers = [];
}

async function waitForWasm() {
    if (wasmIsReady) return;
    await new Promise(resolve => wasmReadyResolvers.push(resolve));
}

export async function updateUrlParams() {
    await waitForWasm();
    const width = document.getElementById("widthInput").value;
    const height = document.getElementById("heightInput").value;
    const rule = document.getElementById("ruleInput").value;
    const field = document.getElementById("fieldInput").value;
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

export async function loadFromUrlParams() {
    await waitForWasm();
    const params = new URLSearchParams(window.location.search);

    const width = params.get("w");
    const height = params.get("h");
    const rule = params.get("r");
    const field = params.get("f");
    const mask = params.get("m");

    if (width) document.getElementById("widthInput").value = width;
    if (height) document.getElementById("heightInput").value = height;
    if (rule) document.getElementById("ruleInput").value = rule.replace(".", "/");
    if (field) document.getElementById("fieldInput").value = field.replace(/-/g, '[').replace(/_/g, "]").replace(".", ";");
    if (mask) setNeighborMask(mask == "d" ? defMask : decode_field(mask, true));
}

export function enforceDisabledControls() {
    document.querySelectorAll('.controls.card button, .controls.card input')
        .forEach(el => el.disabled = true);
}

export function showToast(message, duration = 1500) {
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

export function resetElementValue(elementId, defaultValue = "") {
    const el = document.getElementById(elementId);
    if (el) {
        el.value = defaultValue;

        const event = new Event("input", { bubbles: true });
        el.dispatchEvent(event);
    }

}
