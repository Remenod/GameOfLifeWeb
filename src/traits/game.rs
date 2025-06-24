use crate::game_rule::GameRule;

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

    fn set_cell(&mut self, x: usize, y: usize, value: u8);

    fn get_field(&self) -> &Vec<u8>;

    fn get_height(&self) -> usize;

    fn get_width(&self) -> usize;
}
