import init from "../pkg/game_of_life.js";
import { copyUrl } from "./form.js";
import { clearGrid } from "./canvas.js";
import { loadFromUrlParams } from "./utils.js";
import { updatePreviewCanvas } from "./preview-canvas.js";
import { enforceDisabledControls } from "./utils.js";
import { togglePlay, copyFieldV1, copyFieldV2, copyFieldV3, tick } from "./game.js";

enforceDisabledControls();
loadFromUrlParams();

window.tick = tick;
window.copyField_v1 = copyFieldV1;
window.copyField_v2 = copyFieldV2;
window.copyField_v3 = copyFieldV3;
window.copyUrl = copyUrl;
window.togglePlay = togglePlay;
window.clearGrid = clearGrid;

await init().then(() => {
    updatePreviewCanvas();
});
