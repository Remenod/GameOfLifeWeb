use crate::game_rule::GameRule;

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
    pub fn new(
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

        let neighbours = self
            .offsets
            .iter()
            .filter_map(|(dx, dy)| {
                let nx = x.wrapping_add_signed(*dx as isize);
                let ny = y.wrapping_add_signed(*dy as isize);
                if nx < self.width && ny < self.height {
                    Some(self.current_field[self.get_index(nx, ny)] as u8)
                } else {
                    None
                }
            })
            .sum::<u8>();

        self.game_rule
            .may_survive(self.current_field[index] != 0, neighbours)
    }

    pub fn next_turn(&mut self) {
        for i in 0..(self.height * self.width) {
            let v = self.check_cell_next_turn(i);
            self.next_field[i] = v as u8;
        }

        std::mem::swap(&mut self.current_field, &mut self.next_field);
    }

    pub fn get_cell(&self, x: usize, y: usize) -> bool {
        let index = self.get_index(x, y);

        return if index >= self.total_cells {
            false
        } else {
            self.current_field[index] != 0
        };
    }

    pub fn set_cell(&mut self, x: usize, y: usize, value: u8) {
        let index = self.get_index(x, y);

        if index >= self.total_cells {
            return;
        }

        self.current_field[index] = value;
    }

    pub fn get_field(&self) -> &Vec<u8> {
        &self.current_field
    }

    pub fn get_height(&self) -> usize {
        self.height
    }

    pub fn get_width(&self) -> usize {
        self.width
    }
}
