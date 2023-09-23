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

## 02: Memory Allocation

global alloc_cursor

alloc(size) =
  alloc_cursor += 1
  p = alloc_cursor
  alloc_cursor += size

  return ptr(p)

base = alloc(5)
memset(base + 2, value)
memget(base + 2)
