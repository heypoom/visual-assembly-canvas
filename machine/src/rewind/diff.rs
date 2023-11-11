#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct Patch<T> {
    index: usize,
    from: Option<T>,
    to: Option<T>,
}

pub fn diff_slice<T: PartialEq + Clone>(a: &[T], b: &[T]) -> Vec<Patch<T>> {
    let mut patches: Vec<Patch<T>> = vec![];

    let max_len = a.len().max(b.len());

    for index in 0..max_len {
        let from = a.get(index).map(|e| e.clone());
        let to = b.get(index).map(|e| e.clone());

        if from == to { continue; }

        patches.push(Patch { index, from, to })
    }

    patches
}

#[cfg(test)]
mod diff_tests {
    use crate::rewind::diff::{diff_slice, Patch};

    #[test]
    fn diff_test() {
        let patches = diff_slice(&[0, 0, 1, 2, 0, 0, 0, 3, 4], &[0, 0, 1, 2, 0, 0, 0, 3, 8]);
        assert_eq!(patches[0], Patch { index: 8, from: Some(4), to: Some(8) });

        let patches = diff_slice(&[1], &[1, 2]);
        assert_eq!(patches[0], Patch { index: 1, from: None, to: Some(2) });

        let patches = diff_slice(&[1, 2], &[1]);
        assert_eq!(patches[0], Patch { index: 1, from: Some(2), to: None });
    }
}