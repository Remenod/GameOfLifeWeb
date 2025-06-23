import init from "../pkg/game_of_life.js";
import "./form.js";
import { initToggledCellsCollection, drawPreviewCanvas } from "./canvas.js";
import { enforceDisabledControls, resetElementValue, loadFromUrlParams } from "./utils.js";

enforceDisabledControls();
loadFromUrlParams();

window.resetElementValue = resetElementValue;

await init().then(() => {
    drawPreviewCanvas();
    initToggledCellsCollection();
});
