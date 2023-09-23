# 01: Memory

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

# 02: 

global alloc_cursor

array(size) =
  alloc_cursor += 1
  p = alloc_cursor
  alloc_cursor += size

  return ptr(p)

array_set(ptr, index, value) =
  memset(ptr + index, value)

get_array(ptr, size) = 
  index in 0..size:
    memget(ptr + index)

ptr a = array(5)
array_set(a, 0, 0x11)
array_set(a, 1, 0xFF)
get_array(a, 5)

ptr b = array(10)



