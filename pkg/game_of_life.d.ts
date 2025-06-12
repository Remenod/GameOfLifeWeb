/* tslint:disable */
/* eslint-disable */
export function encode_field(decoded: string): string;
export function decode_field(encoded: string): string;
export function adapt_field_width(matrix_str: string, old_width: number, new_width: number): string;
export function parse_field(input: string, current_width: number): string;
export class WasmGame {
  free(): void;
  constructor(width: number, height: number, field: Uint8Array, rule: string);
  tick(): void;
  get_cell(x: number, y: number): boolean;
  set_cell(x: number, y: number, value: boolean): void;
  export_field(): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wasmgame_free: (a: number, b: number) => void;
  readonly wasmgame_new: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly wasmgame_tick: (a: number) => void;
  readonly wasmgame_get_cell: (a: number, b: number, c: number) => number;
  readonly wasmgame_set_cell: (a: number, b: number, c: number, d: number) => void;
  readonly wasmgame_export_field: (a: number) => [number, number];
  readonly encode_field: (a: number, b: number) => [number, number];
  readonly decode_field: (a: number, b: number) => [number, number];
  readonly adapt_field_width: (a: number, b: number, c: number, d: number) => [number, number];
  readonly parse_field: (a: number, b: number, c: number) => [number, number];
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
