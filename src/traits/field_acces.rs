use rustc_hash::FxHashSet;

pub trait FieldAccess {
    fn is_alive(&self, index: usize) -> bool;
}

impl FieldAccess for FxHashSet<usize> {
    fn is_alive(&self, index: usize) -> bool {
        self.contains(&index)
    }
}

impl FieldAccess for Vec<u8> {
    fn is_alive(&self, index: usize) -> bool {
        self[index] != 0
    }
}
