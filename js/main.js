import init from "../pkg/game_of_life.js";
import { loadFromUrlParams } from "./url-args.js";
import { updatePreviewCanvas } from "./preview-canvas.js";
import { togglePlay, copyField, tick } from "./game.js";
import { clearGrid } from "./canvas.js";
import { copyUrl } from "./form.js";

window.tick = tick;
window.copyField = copyField;
window.copyUrl = copyUrl;
window.togglePlay = togglePlay;
window.clearGrid = clearGrid;

loadFromUrlParams();

await init().then(() => {
    updatePreviewCanvas();
});
