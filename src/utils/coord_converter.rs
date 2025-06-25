pub fn get_index(width: usize, x: usize, y: usize) -> usize {
    y * width + x
}

pub fn get_x_y(width: usize, index: usize) -> (usize, usize) {
    let y = index / width;
    let x = index % width;
    (x, y)
}
