import { BoundedSetQueue, parse_field } from "../pkg/game_of_life.js";
import { game } from "./game.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("webgl")!;

const previewCanvas = document.getElementById("previewCanvas") as HTMLCanvasElement;
const previewCtx = previewCanvas.getContext("webgl")!;

let isDragging = false;
let toggledCells: BoundedSetQueue;

const { program, tex } = initWebGLProgram(ctx);
const { program: previewProgram, tex: previewTex } = initWebGLProgram(previewCtx);

let zoom = 1, offsetX = 0, offsetY = 0;

export async function initToggledCellsCollection() {
    toggledCells = new BoundedSetQueue(20);
}

export function drawCanvas() {
    renderWebGLField(ctx, program, tex, game.export_pixels(), game.get_width(), game.get_height(), zoom, offsetX, offsetY)
}

export function drawPreviewCanvas() {
    const width = parseInt((document.getElementById("widthInput") as HTMLInputElement).value, 10);
    const height = parseInt((document.getElementById("heightInput") as HTMLInputElement).value, 10);
    const fld = parse_field((document.getElementById("fieldInput") as HTMLInputElement).value.trim(), width);

    const fieldData = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            fieldData[y * width + x] = (idx < fld.length ? fld[idx] === 1 : false) ? 255 : 0;
        }
    }
    renderWebGLField(previewCtx, previewProgram, previewTex, fieldData, width, height, 1, 0, 0)
}

function initWebGLProgram(gl: WebGLRenderingContext) {
    const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        uniform float u_zoom;
        uniform vec2 u_offset;

        void main() {
            vec2 zoomed = a_position * u_zoom + u_offset;
            v_texCoord = zoomed * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }`;
    const fsSource = `
        precision mediump float;
        uniform sampler2D u_field;
        uniform vec2 u_resolution;
        varying vec2 v_texCoord;

        void main() {
            vec2 cellCoord = vec2(v_texCoord.x, 1.0 - v_texCoord.y) * u_resolution;
            float cell = texture2D(u_field, (floor(cellCoord) + 0.5) / u_resolution).r;
            float color = 1.0 - cell;
            gl_FragColor = vec4(vec3(color), 1.0);
        }`;

    const vShader = createShader(gl, gl.VERTEX_SHADER, vsSource)!;
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource)!;
    const program = createProgram(gl, vShader, fShader)!;

    const posBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return { program, tex };
}

function renderWebGLField(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    tex: WebGLTexture,
    fieldData: Uint8Array,
    fieldWidth: number,
    fieldHeight: number,
    zoom: number,
    offsetX: number,
    offsetY: number
) {
    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, fieldWidth, fieldHeight, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, fieldData);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1i(gl.getUniformLocation(program, "u_field"), 0);
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), fieldWidth, fieldHeight);

    gl.uniform1f(gl.getUniformLocation(program, "u_zoom"), zoom);
    gl.uniform2f(gl.getUniformLocation(program, "u_offset"), offsetX, offsetY);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl: WebGLRenderingContext, vShader: WebGLShader, fShader: WebGLShader): WebGLProgram | null {
    const program = gl.createProgram()!;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function getCanvasCoords(
    event: MouseEvent | TouchEvent,
    zoom: number = 1,
    offsetX: number = 0,
    offsetY: number = 0,
    fieldWidth: number = game.get_width(),
    fieldHeight: number = game.get_height()
): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;

    if ("touches" in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const ndcX = ((clientX - rect.left) * scaleX / canvas.width) * 2 - 1;
    const ndcY = ((clientY - rect.top) * scaleY / canvas.height) * 2 - 1;

    const fx = (ndcX * zoom + offsetX) * 0.5 + 0.5;
    const fy = (ndcY * zoom + offsetY) * 0.5 + 0.5;

    const x = Math.round(fx * fieldWidth - 2);
    const y = Math.round(fy * fieldHeight - 2);

    return { x, y };
}

function toggleCellAtEvent(event: MouseEvent | TouchEvent) {
    const { x, y } = getCanvasCoords(event);

    const key = `${x},${y}`;
    if (x >= 0 && x < game.get_width() && y >= 0 && y < game.get_height() && !toggledCells.has(key)) {
        const alive = game.get_cell(x, y);
        game.set_cell(x, y, !alive);
        toggledCells.add(key);
        drawCanvas();
    }
}

export function addCanvasListeners() {
    canvas.addEventListener("mousedown", (event) => {
        isDragging = true;
        toggledCells.clear();
        toggleCellAtEvent(event);
    });

    canvas.addEventListener("mousemove", (event) => {
        if (isDragging) toggleCellAtEvent(event);
    });

    canvas.addEventListener("mouseup", () => {
        isDragging = false;
        toggledCells.clear();
    });

    canvas.addEventListener("mouseleave", () => {
        isDragging = false;
        toggledCells.clear();
    });

    canvas.addEventListener("touchstart", (event) => {
        event.preventDefault();
        isDragging = true;
        toggledCells.clear();
        toggleCellAtEvent(event);
    }, { passive: false });

    canvas.addEventListener("touchmove", (event) => {
        event.preventDefault();
        if (isDragging) toggleCellAtEvent(event);
    }, { passive: false });

    canvas.addEventListener("touchend", () => {
        isDragging = false;
        toggledCells.clear();
    });

    canvas.addEventListener("touchcancel", () => {
        isDragging = false;
        toggledCells.clear();
    });
}

(document.getElementById("zoomInBtn") as HTMLButtonElement).onclick = () => {
    zoom /= 1.1;
    drawCanvas();
};

const offsetScale = 0.01 * zoom;

(document.getElementById("zoomOutBtn") as HTMLButtonElement).onclick = () => {
    zoom *= 1.1;
    drawCanvas();
};

(document.getElementById("moveLeftBtn") as HTMLButtonElement).onclick = () => {
    offsetX -= offsetScale;
    drawCanvas();
};

(document.getElementById("moveRightBtn") as HTMLButtonElement).onclick = () => {
    offsetX += offsetScale;
    drawCanvas();
};

(document.getElementById("moveUpBtn") as HTMLButtonElement).onclick = () => {
    offsetY += offsetScale;
    drawCanvas();
};

(document.getElementById("moveDownBtn") as HTMLButtonElement).onclick = () => {
    offsetY -= offsetScale;
    drawCanvas();
};
(document.getElementById("resetZoomBtn") as HTMLButtonElement).onclick = () => {
    offsetY = 0;
    offsetX = 0;
    zoom = 1;
    drawCanvas();
};
