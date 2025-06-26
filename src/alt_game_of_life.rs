use crate::{
    game_rule::GameRule,
    traits::{field_acces::FieldAccess, game::Game},
    utils::{check_cell_next_turn::*, coord_converter::*},
};
use once_cell::sync::Lazy;
use rustc_hash::{FxBuildHasher, FxHashSet};

pub struct AltGameOfLife {
    width: usize,
    height: usize,
    total_cells: usize,
    current_field: FxHashSet<usize>,
    next_field: FxHashSet<usize>,
    empty_to_check: FxHashSet<usize>,
    game_rule: GameRule,
    offsets: Vec<(i8, i8)>,
}

static FULL_OFFSETS: Lazy<Vec<(i8, i8)>> = Lazy::new(|| GameRule::get_offsets(&vec![1; 25]));

impl Game for AltGameOfLife {
    fn new(
        width: usize,
        height: usize,
        current: Vec<u8>,
        game_rule: GameRule,
        check_rule: &[u8],
    ) -> AltGameOfLife {
        let offsets = GameRule::get_offsets(check_rule);
        AltGameOfLife {
            width: width,
            height: height,
            total_cells: width * height,
            next_field: FxHashSet::with_capacity_and_hasher(
                current.len(),
                FxBuildHasher::default(),
            ),
            empty_to_check: FxHashSet::with_capacity_and_hasher(
                current.len() * offsets.len(),
                FxBuildHasher::default(),
            ),
            current_field: current
                .into_iter()
                .enumerate()
                .filter(|(_, x)| *x != 0)
                .map(|(i, _)| i)
                .collect(),
            game_rule: game_rule,
            offsets: offsets,
        }
    }

    fn next_turn(&mut self) {
        self.empty_to_check.clear();
        self.next_field.clear();

        for cell in &self.current_field {
            if check_cell_next_turn(
                &self.current_field,
                &self.game_rule,
                *cell,
                self.width,
                self.height,
                &self.offsets,
            ) {
                self.next_field.insert(*cell);
            }

            let (x, y) = get_x_y(self.width, *cell);
            for (dx, dy) in FULL_OFFSETS.iter() {
                let nx = x.wrapping_add_signed(*dx as isize);
                let ny = y.wrapping_add_signed(*dy as isize);

                if nx < self.width && ny < self.height {
                    let index = get_index(self.width, nx, ny);
                    if !self.current_field.is_alive(index) {
                        self.empty_to_check.insert(index);
                    }
                }
            }
        }

        for cell in &self.empty_to_check {
            if check_cell_next_turn(
                &self.current_field,
                &self.game_rule,
                *cell,
                self.width,
                self.height,
                &self.offsets,
            ) {
                self.next_field.insert(*cell);
            }
        }
        self.current_field = std::mem::take(&mut self.next_field);
    }

    fn get_cell(&self, x: usize, y: usize) -> bool {
        let index = get_index(self.width, x, y);

        return if index >= self.total_cells {
            false
        } else {
            self.current_field.contains(&index)
        };
    }

    fn set_cell(&mut self, x: usize, y: usize, value: bool) {
        let index = get_index(self.width, x, y);

        if index >= self.total_cells {
            return;
        }
        if value {
            self.current_field.insert(index);
        } else {
            self.current_field.remove(&index);
        }
    }

    fn export_field(&self) -> String {
        let mut s = String::with_capacity(self.total_cells);
        for i in 0..self.total_cells {
            s.push(if self.current_field.contains(&i) {
                '1'
            } else {
                '0'
            });
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
