use crate::{game_rule::GameRule, traits::field_acces::FieldAccess, utils::coord_converter::*};

pub fn check_cell_next_turn<F: FieldAccess>(
    field: &F,
    game_rule: &GameRule,
    index: usize,
    width: usize,
    height: usize,
    offsets: &[(i8, i8)],
) -> bool {
    let (x, y) = get_x_y(width, index);

    let neighbours = offsets
        .iter()
        .filter_map(|(dx, dy)| {
            let nx = x.wrapping_add_signed(*dx as isize);
            let ny = y.wrapping_add_signed(*dy as isize);
            if nx < width && ny < height {
                Some(field.is_alive(get_index(width, nx, ny)) as u8)
            } else {
                None
            }
        })
        .sum::<u8>();

    game_rule.may_survive(field.is_alive(index), neighbours)
}
