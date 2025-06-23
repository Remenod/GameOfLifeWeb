import init from "../pkg/game_of_life.js";
import { copyUrl, resetNeighborMask } from "./form.js";
import { loadFromUrlParams } from "./utils.js";
import { initToggledCellsCollection, drawPreviewCanvas } from "./canvas.js";
import { enforceDisabledControls, resetElementValue, openHelp } from "./utils.js";
import { togglePlay, copyField_v1, copyField_v2, copyField_v3, tick, clearGrid } from "./game.js";

enforceDisabledControls();
loadFromUrlParams();

window.tick = tick;
window.copyField_v1 = copyField_v1;
window.copyField_v2 = copyField_v2;
window.copyField_v3 = copyField_v3;
window.copyUrl = copyUrl;
window.togglePlay = togglePlay;
window.resetNeighborMask = resetNeighborMask;
window.clearGrid = clearGrid;
window.resetElementValue = resetElementValue;
window.openHelp = openHelp;

await init().then(() => {
    drawPreviewCanvas();
    initToggledCellsCollection();
});
