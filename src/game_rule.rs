use once_cell::sync::Lazy;
use regex::Regex;
use std::collections::HashSet;

static RULE_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^B[0-8]*/S[0-8]*$").unwrap());

pub struct GameRule {
    birth_rules: HashSet<u8>,
    survive_rules: HashSet<u8>,
}

impl GameRule {
    pub fn new(born: HashSet<u8>, survive: HashSet<u8>) -> GameRule {
        GameRule {
            birth_rules: born,
            survive_rules: survive,
        }
    }

    pub fn may_survive(&self, current: bool, neighbours_count: u8) -> bool {
        if current {
            self.survive_rules.contains(&neighbours_count)
        } else {
            self.birth_rules.contains(&neighbours_count)
        }
    }

    pub fn get_offsets(bits: &[u8]) -> Vec<(i8, i8)> {
        const SIZE: i8 = 5;
        const CENTER: i8 = SIZE / 2;
        let mut offsets = Vec::new();

        let mut normalized = [0u8; (SIZE * SIZE) as usize];
        let len = bits.len().min(25);
        normalized[..len].copy_from_slice(&bits[..len]);

        for (i, &b) in normalized.iter().enumerate() {
            if b != 0 {
                offsets.push(((i as i8 % SIZE) - CENTER, (i as i8 / SIZE) - CENTER));
            }
        }

        offsets
    }
}

impl TryFrom<&str> for GameRule {
    type Error = String;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        if !RULE_REGEX.is_match(value) {
            return Err("Invalid format. Expected format like B3/S23".to_string());
        }

        let parts: Vec<&str> = value.split('/').collect();

        let born_state: HashSet<u8> = parts[0]
            .strip_prefix('B')
            .ok_or("Missing 'B' prefix")?
            .chars()
            .map(|c| c.to_digit(10).ok_or("Non-digit in B part"))
            .collect::<Result<HashSet<_>, _>>()?
            .into_iter()
            .map(|d| d as u8)
            .collect();

        let survive_state: HashSet<u8> = parts[1]
            .strip_prefix('S')
            .ok_or("Missing 'S' prefix")?
            .chars()
            .map(|c| c.to_digit(10).ok_or("Non-digit in S part"))
            .collect::<Result<HashSet<_>, _>>()?
            .into_iter()
            .map(|d| d as u8)
            .collect();

        Ok(GameRule {
            birth_rules: born_state,
            survive_rules: survive_state,
        })
    }
}

impl Default for GameRule {
    fn default() -> Self {
        GameRule::new([3].into_iter().collect(), [2, 3].into_iter().collect())
    }
}
