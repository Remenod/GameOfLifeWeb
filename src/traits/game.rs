use crate::game_rule::GameRule;
// use std::collections::HashSet;

pub trait Game {
    fn new(
        width: usize,
        height: usize,
        current: Vec<u8>,
        game_rule: GameRule,
        check_rule: &[u8],
    ) -> Self
    where
        Self: Sized;

    fn next_turn(&mut self);

    fn get_cell(&self, x: usize, y: usize) -> bool;

    fn set_cell(&mut self, x: usize, y: usize, value: bool);

    fn export_field(&self) -> String;

    fn get_height(&self) -> usize;

    fn get_width(&self) -> usize;

    fn export_pixels(&self) -> Vec<u8>;

    // fn export_changes(&self) -> HashSet<u8>;
}
