use wasm_bindgen::prelude::*;

const WIDTH: usize = 100;
const HEIGHT: usize = 100;
const VOLUME: usize = WIDTH * HEIGHT;

const OFFSETS: [(isize, isize); 8] = [
    (-1, -1),
    (-1, 0),
    (-1, 1),
    (0, -1),
    (0, 1),
    (1, -1),
    (1, 0),
    (1, 1),
];

fn get_index(x: usize, y: usize) -> usize {
    y * WIDTH + x
}

fn get_x_y(index: usize) -> (usize, usize) {
    let y = index / WIDTH;
    let x = index % WIDTH;
    (x, y)
}

fn check_next_turn(data: &Vec<bool>, index: usize) -> bool {
    let (x, y) = get_x_y(index);

    let neighbours: u8 = OFFSETS
        .iter()
        .map(|(dx, dy)| (x.wrapping_add_signed(*dx), y.wrapping_add_signed(*dy)))
        .filter(|(nx, ny)| *nx < WIDTH && *ny < HEIGHT)
        .map(|(nx, ny)| data[get_index(nx, ny)] as u8)
        .sum();

    match neighbours {
        2 => data[index],
        //0 | 1 | 4..=8 => false,
        3 => true,
        _ => false,
    }
}

#[wasm_bindgen]
pub fn main() {
    let mut curr_field = vec![false; VOLUME.into()];
    let mut prev_field = curr_field.clone();

    for i in 0..VOLUME {
        curr_field[i] = check_next_turn(&prev_field, i);
    }
}
