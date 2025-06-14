use crate::game_rule::GameRule;
use bitvec::prelude::*;

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

pub struct GameOfLife {
    width: usize,
    height: usize,
    current_field: BitVec,
    next_field: BitVec,
    game_rule: GameRule,
}

impl GameOfLife {
    pub fn new(width: usize, height: usize, current: BitVec, game_rule: GameRule) -> GameOfLife {
        GameOfLife {
            width: width,
            height: height,
            current_field: current,
            next_field: bitvec![0; width * height],
            game_rule: game_rule,
        }
    }

    fn get_index(&self, x: usize, y: usize) -> usize {
        y * self.width + x
    }

    fn get_x_y(&self, index: usize) -> (usize, usize) {
        let y = index / self.width;
        let x = index % self.width;
        (x, y)
    }

    fn check_cell_next_turn(&self, index: usize) -> bool {
        let (x, y) = self.get_x_y(index);

        let neighbours: u8 = OFFSETS
            .iter()
            .map(|(dx, dy)| (x.wrapping_add_signed(*dx), y.wrapping_add_signed(*dy)))
            .filter(|(nx, ny)| *nx < self.width && *ny < self.height)
            .map(|(nx, ny)| self.current_field[self.get_index(nx, ny)] as u8)
            .sum();

        self.game_rule
            .may_survive(self.current_field[index], &neighbours)
    }

    pub fn next_turn(&mut self) {
        for i in 0..(self.height * self.width) {
            let v = self.check_cell_next_turn(i);
            self.next_field.set(i, v);
        }

        std::mem::swap(&mut self.current_field, &mut self.next_field);
    }

    pub fn get_cell(&self, x: usize, y: usize) -> bool {
        let index = self.get_index(x, y);

        return if index > self.height * self.width {
            false
        } else {
            self.current_field[index]
        };
    }

    pub fn set_cell(&mut self, x: usize, y: usize, value: bool) {
        let index = self.get_index(x, y);

        if index > self.height * self.width {
            return;
        }

        self.current_field.set(index, value);
    }

    pub fn get_field(&self) -> &BitVec {
        &self.current_field
    }
}
