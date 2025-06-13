import init from "../pkg/game_of_life.js";
import { clearGrid } from "./canvas.js";
import { loadFromUrlParams } from "./utils.js";
import { updatePreviewCanvas } from "./preview-canvas.js";
import { copyUrl, pasteTemplate } from "./form.js";
import { enforceDisabledControls, resetElementValue } from "./utils.js";
import { togglePlay, copyField_v1, copyField_v2, copyField_v3, tick } from "./game.js";

enforceDisabledControls();
loadFromUrlParams();

window.tick = tick;
window.copyField_v1 = copyField_v1;
window.copyField_v2 = copyField_v2;
window.copyField_v3 = copyField_v3;
window.copyUrl = copyUrl;
window.togglePlay = togglePlay;
window.clearGrid = clearGrid;
window.pasteTemplate = pasteTemplate;
window.resetElementValue = resetElementValue;

await init().then(() => {
    updatePreviewCanvas();
});
