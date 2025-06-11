mod game_of_life;
mod game_rule;

use crate::game_of_life::GameOfLife;
use wasm_bindgen::prelude::*;

const WIDTH: usize = 100;
const HEIGHT: usize = 100;

#[wasm_bindgen]
pub struct WasmGame {
    inner: GameOfLife,
}

#[wasm_bindgen]
impl WasmGame {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmGame {
        WasmGame {
            inner: GameOfLife::new(
                WIDTH,
                HEIGHT,
                vec![false; WIDTH * HEIGHT],
                "B3/S23".try_into().unwrap(),
            ),
        }
    }

    pub fn tick(&mut self) {
        self.inner.next_turn();
    }

    pub fn get_cell(&self, x: usize, y: usize) -> bool {
        self.inner.get_cell(x, y)
    }

    pub fn set_cell(&mut self, x: usize, y: usize, value: bool) {
        self.inner.set_cell(x, y, value);
    }
}

//#[wasm_bindgen]
