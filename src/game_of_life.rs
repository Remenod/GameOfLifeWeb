use crate::{game_rule::GameRule, traits::game::Game, utils::coord_converter::*};

pub struct GameOfLife {
    width: usize,
    height: usize,
    total_cells: usize,
    current_field: Vec<u8>,
    next_field: Vec<u8>,
    game_rule: GameRule,
    offsets: Vec<(i8, i8)>,
}

impl GameOfLife {
    fn check_cell_next_turn(&self, index: usize) -> bool {
        let (x, y) = get_x_y(self.width, index);

        let neighbours = self
            .offsets
            .iter()
            .filter_map(|(dx, dy)| {
                let nx = x.wrapping_add_signed(*dx as isize);
                let ny = y.wrapping_add_signed(*dy as isize);
                if nx < self.width && ny < self.height {
                    Some(self.current_field[get_index(self.width, nx, ny)] as u8)
                } else {
                    None
                }
            })
            .sum::<u8>();

        self.game_rule
            .may_survive(self.current_field[index] != 0, neighbours)
    }
}

impl Game for GameOfLife {
    fn new(
        width: usize,
        height: usize,
        mut current: Vec<u8>,
        game_rule: GameRule,
        check_rule: &[u8],
    ) -> GameOfLife {
        let target_len = height * width;

        current.truncate(target_len);

        if current.len() < target_len {
            current.resize(target_len, 0);
        }

        GameOfLife {
            width: width,
            height: height,
            total_cells: target_len,
            current_field: current,
            next_field: vec![0; width * height],
            game_rule: game_rule,
            offsets: GameRule::get_offsets(check_rule),
        }
    }
    fn next_turn(&mut self) {
        for i in 0..(self.height * self.width) {
            let v = self.check_cell_next_turn(i);
            self.next_field[i] = v as u8;
        }

        std::mem::swap(&mut self.current_field, &mut self.next_field);
    }

    fn get_cell(&self, x: usize, y: usize) -> bool {
        let index = get_index(self.width, x, y);

        return if index >= self.total_cells {
            false
        } else {
            self.current_field[index] != 0
        };
    }

    fn set_cell(&mut self, x: usize, y: usize, value: u8) {
        let index = get_index(self.width, x, y);

        if index >= self.total_cells {
            return;
        }

        self.current_field[index] = value;
    }

    fn export_field(&self) -> String {
        let mut s = String::with_capacity(self.total_cells);
        for b in &self.current_field {
            s.push(if *b != 0 { '1' } else { '0' });
        }
        s
    }

    fn get_height(&self) -> usize {
        self.height
    }

    fn get_width(&self) -> usize {
        self.width
    }
}
