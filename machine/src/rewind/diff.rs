#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct Patch {
    index: usize,
    from: Option<u16>,
    to: Option<u16>,
}

pub fn diff_u16_vec(a: &[u16], b: &[u16]) -> Vec<Patch> {
    let mut patches = vec![];

    let max_len = a.len().max(b.len());

    for index in 0..max_len {
        let from = a.get(index).map(|e| e.to_owned());
        let to = b.get(index).map(|e| e.to_owned());

        if from == to { continue; }

        patches.push(Patch { index, from, to })
    }

    patches
}

#[cfg(test)]
mod diff_tests {
    use crate::rewind::diff::{diff_u16_vec, Patch};

    #[test]
    fn diff_test() {
        let patches = diff_u16_vec(&[0, 0, 1, 2, 0, 0, 0, 3, 4], &[0, 0, 1, 2, 0, 0, 0, 3, 8]);
        assert_eq!(patches[0], Patch { index: 8, from: Some(4), to: Some(8) });

        let patches = diff_u16_vec(&[1], &[1, 2]);
        assert_eq!(patches[0], Patch { index: 1, from: None, to: Some(2) });

        let patches = diff_u16_vec(&[1, 2], &[1]);
        assert_eq!(patches[0], Patch { index: 1, from: Some(2), to: None });
    }
}