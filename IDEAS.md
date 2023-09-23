## 01: Memory

00 01 02 03 04 05 06 07
AA BB CC DD EE FF 88 77

```rs
mut memory: [u8; 0xFFFF] = [0; 0xFFFF]
```

```rs
memset(offset: u16, byte: u8) -> u8 =
  memory[offset] = value

memget(offset) = memory[offset]
```

## 02: Naive Memory Allocation

```rs
let cursor = 0

fn alloc(size) =
  out = cursor.clone()
  cursor += size

  return out

base = alloc(5)
set(base + 2, 5)
```
