use crate::{game_rule::GameRule, traits::game::Game, utils::coord_converter::*};
use rustc_hash::FxHashSet;

struct AltGameOfLife {
    width: usize,
    height: usize,
    total_cells: usize,
    current_field: FxHashSet<u8>,
    next_field: FxHashSet<u8>,
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
    ) -> Self
    where
        Self: Sized,
    {
        todo!()
    }

    fn next_turn(&mut self) {
        todo!()
    }

    fn get_cell(&self, x: usize, y: usize) -> bool {
        todo!()
    }

    fn set_cell(&mut self, x: usize, y: usize, value: u8) {
        todo!()
    }

    fn get_field(&self) -> &Vec<u8> {
        todo!()
    }

    fn get_height(&self) -> usize {
        todo!()
    }

    fn get_width(&self) -> usize {
        todo!()
    }
}
