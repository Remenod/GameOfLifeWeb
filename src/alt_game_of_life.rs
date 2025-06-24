use crate::{game_rule::GameRule, traits::game::Game, utils::coord_converter::*};
use rustc_hash::FxHashSet;

struct AltGameOfLife {
    width: usize,
    height: usize,
    total_cells: usize,
    current_field: FxHashSet<usize>,
    next_field: FxHashSet<usize>,
    game_rule: GameRule,
    offsets: Vec<(i8, i8)>,
}

impl Game for AltGameOfLife {
    fn new(
        width: usize,
        height: usize,
        current: Vec<u8>,
        game_rule: GameRule,
        check_rule: &[u8],
    ) -> AltGameOfLife {
        AltGameOfLife {
            width: width,
            height: height,
            total_cells: width * height,
            current_field: current
                .into_iter()
                .enumerate()
                .filter(|(_, x)| *x != 0)
                .map(|(i, _)| i)
                .collect(),
            next_field: FxHashSet::default(),
            game_rule: game_rule,
            offsets: GameRule::get_offsets(check_rule),
        }
    }

    fn next_turn(&mut self) {
        todo!()
    }

    fn get_cell(&self, x: usize, y: usize) -> bool {
        let index = get_index(self.width, x, y);

        return if index >= self.total_cells {
            false
        } else {
            self.current_field.contains(&index)
        };
    }

    fn set_cell(&mut self, x: usize, y: usize, value: u8) {
        let index = get_index(self.width, x, y);

        if index >= self.total_cells {
            return;
        }
        if value != 0 {
            self.current_field.insert(index);
        } else {
            self.current_field.remove(&index);
        }
    }

    fn export_field(&self) -> String {
        todo!()
    }

    fn get_height(&self) -> usize {
        self.height
    }

    fn get_width(&self) -> usize {
        self.width
    }
}
