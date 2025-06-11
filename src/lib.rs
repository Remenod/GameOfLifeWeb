mod game_of_life;
mod game_rule;

use crate::game_of_life::GameOfLife;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmGame {
    inner: GameOfLife,
}

#[wasm_bindgen]
impl WasmGame {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize, field: Vec<u8>, rule: &str) -> WasmGame {
        WasmGame {
            inner: GameOfLife::new(
                width,
                height,
                field.into_iter().map(|b| b != 0).collect(),
                rule.try_into().unwrap(),
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

    pub fn export_field(&self) -> String {
        self.inner
            .get_field()
            .iter()
            .map(|&b| if b { '1' } else { '0' })
            .collect()
    }
}
