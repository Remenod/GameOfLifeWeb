import init from "../pkg/game_of_life.js";
import { resetNeighborMask } from "./form.js";
import { loadFromUrlParams } from "./utils.js";
import { initToggledCellsCollection, drawPreviewCanvas } from "./canvas.js";
import { enforceDisabledControls, resetElementValue, openHelp } from "./utils.js";

enforceDisabledControls();
loadFromUrlParams();

window.resetNeighborMask = resetNeighborMask;
window.resetElementValue = resetElementValue;
window.openHelp = openHelp;

await init().then(() => {
    drawPreviewCanvas();
    initToggledCellsCollection();
});
