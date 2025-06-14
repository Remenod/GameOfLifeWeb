mod bounded_set_queue;
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

fn to_radix62(mut num: u32) -> String {
    const CHARS: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if num == 0 {
        return "0".to_string();
    }
    let mut res = Vec::new();
    while num > 0 {
        res.push(CHARS[(num % 62) as usize]);
        num /= 62;
    }
    res.reverse();
    String::from_utf8(res).unwrap()
}

fn from_radix62(s: &str) -> Option<u32> {
    let mut result: u32 = 0;
    for c in s.chars() {
        let digit = match c {
            '0'..='9' => c as u32 - '0' as u32,
            'a'..='z' => c as u32 - 'a' as u32 + 10,
            'A'..='Z' => c as u32 - 'A' as u32 + 36,
            _ => return None,
        };
        result = result.checked_mul(62)?.checked_add(digit)?;
    }
    Some(result)
}

#[wasm_bindgen]
pub fn encode_field(decoded: &str, v3mode: bool) -> String {
    let mut chars = decoded.chars();
    let mut current_char = chars.next().unwrap();
    let mut count: u32 = 1;
    let mut result = current_char.to_string();

    for c in chars {
        if c == current_char {
            count += 1;
        } else {
            if count > (if v3mode { 61 } else { 9 }) {
                result.push('[');
                let val = if v3mode {
                    &to_radix62(count)
                } else {
                    &count.to_string()
                };
                result.push_str(val);
                result.push(']');
            } else {
                let val = if v3mode {
                    &to_radix62(count)
                } else {
                    &count.to_string()
                };
                result.push_str(val);
            }
            current_char = c;
            count = 1;
        }
    }

    if count > (if v3mode { 61 } else { 9 }) {
        result.push('[');
        let val = if v3mode {
            &to_radix62(count)
        } else {
            &count.to_string()
        };
        result.push_str(val);
        result.push(']');
    } else {
        let val = if v3mode {
            &to_radix62(count)
        } else {
            &count.to_string()
        };
        result.push_str(val);
    }
    result
}

#[wasm_bindgen]
pub fn decode_field(encoded: &str, v3mode: bool) -> String {
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
            if v3mode {
                from_radix62(&number).unwrap_or(0)
            } else {
                number.parse::<u32>().unwrap_or(0)
            }
        } else {
            chars.next();
            if v3mode {
                from_radix62(&c.to_string()).unwrap_or(0)
            } else {
                c.to_digit(10).unwrap_or(0)
            }
        };

        s.extend(std::iter::repeat(current_char).take(count as usize));
        current_char = if current_char == '0' { '1' } else { '0' };
    }

    s
}

#[wasm_bindgen]
pub fn adapt_field_width(matrix_str: &str, old_width: usize, new_width: usize) -> String {
    let old_height = matrix_str.len() / old_width;
    let mut result = String::with_capacity(old_height * new_width);

    for row in 0..old_height {
        let start = row * old_width;
        let end = start + old_width;
        let row_data = &matrix_str[start..end];

        if new_width > old_width {
            result.push_str(row_data);
            result.push_str(&"0".repeat(new_width - old_width));
        } else {
            result.push_str(&row_data[..new_width]);
        }
    }

    result
}

#[wasm_bindgen]
pub fn parse_field(input: &str, current_width: usize) -> String {
    let input = input.trim();

    let header_owned;

    let (header, data) = if let Some(index) = input.find(';') {
        let (h, d) = input.split_at(index);
        (h, &d[1..]) // skip ';'
    } else {
        header_owned = format!("v1w{}", current_width);
        (header_owned.as_str(), input)
    };

    let re = regex::Regex::new(r"^v([123])w(\d+)$").unwrap();
    let (version, width) = if let Some(caps) = re.captures(header) {
        (
            caps[1].parse::<u8>().unwrap_or(1),
            caps[2].parse::<usize>().unwrap_or(current_width),
        )
    } else {
        (1, current_width)
    };

    let decoded = if version != 1 {
        decode_field(data, version == 3)
    } else {
        data.to_string()
    };

    if current_width == width {
        decoded
    } else {
        adapt_field_width(&decoded, width, current_width)
    }
}

#[cfg(all(test, not(target_arch = "wasm32"), feature = "native"))]
mod tests {
    use super::*;
    use rand::Rng;

    #[test]
    fn test_random_round_trip() {
        let mut rng = rand::thread_rng();
        for _ in 0..3000 {
            let bools: Vec<bool> = (0..30000).map(|_| rng.gen_bool(0.5)).collect();

            let original: String = bools.iter().map(|&b| if b { '1' } else { '0' }).collect();
            let encoded = encode_field(&original);
            let decoded = decode_field(&encoded);

            assert_eq!(decoded, original);
        }
    }

    #[test]
    fn test_field_adapter() {
        assert_eq!(
            "11100111001110000000",
            adapt_field_width("111111111000", 3, 5)
        );
        assert_eq!(
            "111111111000",
            adapt_field_width("11101111001110000000", 5, 3)
        );
    }
}
