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

    pub fn encode_field(decoded: &str) -> String {
        let mut chars = decoded.chars();
        let mut current_char = chars.next().unwrap();
        let mut count: u32 = 1;
        let mut result = current_char.to_string();

        for c in chars {
            if c == current_char {
                count += 1;
            } else {
                if count > 9 {
                    result.push('[');
                    result.push_str(&count.to_string());
                    result.push(']');
                } else {
                    result.push_str(&count.to_string());
                }
                current_char = c;
                count = 1;
            }
        }

        if count > 9 {
            result.push('[');
            result.push_str(&count.to_string());
            result.push(']');
        } else {
            result.push_str(&count.to_string());
        }
        result
    }

    pub fn decode_field(encoded: &str) -> String {
        let mut chars = encoded.chars().peekable();
        let mut current_char = chars.next().unwrap_or('0');
        let mut s = String::new();

        while let Some(&c) = chars.peek() {
            let count = if c == '[' {
                chars.next();
                let mut number = String::new();
                while let Some(&digit) = chars.peek() {
                    if digit == ']' {
                        chars.next();
                        break;
                    }
                    number.push(digit);
                    chars.next();
                }
                number.parse::<usize>().unwrap_or(0)
            } else {
                chars.next();
                c.to_digit(10).unwrap_or(0) as usize
            };

            s.extend(std::iter::repeat(current_char).take(count));
            current_char = if current_char == '0' { '1' } else { '0' };
        }

        s
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::Rng;

    #[test]
    fn test_random_round_trip() {
        let mut rng = rand::rngs::ThreadRng::default();
        for _ in 0..3000 {
            let bools: Vec<bool> = (0..30000).map(|_| rng.random_bool(0.5)).collect();

            let original: String = bools.iter().map(|&b| if b { '1' } else { '0' }).collect();
            let encoded = WasmGame::encode_field(&original);
            let decoded = WasmGame::decode_field(&encoded);

            assert_eq!(decoded, original);
        }
    }
}
