use std::collections::{HashSet, VecDeque};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct BoundedSetQueue {
    set: HashSet<String>,
    queue: VecDeque<String>,
    limit: usize,
}

#[wasm_bindgen]
impl BoundedSetQueue {
    #[wasm_bindgen(constructor)]
    pub fn new(limit: usize) -> BoundedSetQueue {
        Self {
            set: HashSet::new(),
            queue: VecDeque::new(),
            limit,
        }
    }

    pub fn has(&self, value: &str) -> bool {
        self.set.contains(value)
    }

    pub fn add(&mut self, value: String) {
        if self.set.contains(&value) {
            return;
        }

        self.set.insert(value.clone());
        self.queue.push_back(value);

        if self.set.len() > self.limit {
            if let Some(oldest) = self.queue.pop_front() {
                self.set.remove(&oldest);
            }
        }
    }

    pub fn clear(&mut self) {
        self.set.clear();
        self.queue.clear();
    }
}
