import init from "../pkg/game_of_life.js";
import "./form.js";
import { initToggledCellsCollection, drawPreviewCanvas } from "./canvas.js";
import { enforceDisabledControls, loadFromUrlParams, setWasmReady } from "./utils.js";

loadFromUrlParams();
enforceDisabledControls();

await init().then(() => {
    setWasmReady()
    drawPreviewCanvas();
    initToggledCellsCollection();
});
