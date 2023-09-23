# Ideas

## 01: Contiguous Memory

00 01 02 03 04 05 06 07
AA BB CC DD EE FF 88 77

```rust
static MEMORY: [u8; 0xFFFF] = [0; 0xFFFF];
```

```txt
memset(offset: u16, byte: u8) -> u8 =
  memory[offset] = value

memget(offset) = memory[offset]
```

## 02: Naive Memory Allocation

Maybe we can allocate the memory simply by keeping track of the cursor? This is pretty dumb, but it's a start.

```txt
let cursor = 0

fn alloc(size) =
  out = cursor.clone()
  cursor += size

  return out

base = alloc(5)
set(base + 2, 5)
```

## 03: Registers

We're going to have 16 registers, each 8-bit: `[u8; 0xF]`

```md
R01: 0x00
R01: 0x00
R02: 0x02
R03: 0x03
R04: 0x04
R05: 0x05
R06: 0x06
R07: 0x07
R08: 0x08
R09: 0x09
R10: 0x0A

R11: 0x0B
  FP: Frame Pointer
  Stores the starting memory address of the stack frame.

R12: 0x0C
  SP: Stack Pointer.
  Keep track of the top of the stack.

R13: 0x0D
  PC: Program Counter.
  Keep track of the current instruction pointer.

R14: 0x0E
  SR: Status Register
  Stores the status flags of the program execution.
```

### Base Memory Layout

```md
0x0000 - 0x1000
  Code Segment: `text`
  Stores the program instructions.
  Read-only.

0x1000 - 0x2000
  Initialized Data Segment: `data`
  Contains the variables initialized in the code.
  TODO: const variables should be read-only. needs separate sections.

0x2000 - 0x3000
  Uninitialized Data Segment: `bss`
  Initializes to zero.
  Contains all global variables that are initialized to zero, or do not have an explicit initialization in code, such as `int i`

after 0x3000
  Heap.
  Contains all dynamically allocated memory.
  Grows to larger addresses.
  Use malloc, realloc and free.

below 0xFFFF
  Stack.
  Stack is LIFO.
  Contains the program stack frames.
  Stack frames contain the local variables of the function.
  Makes recursion possible.
  When the heap and stack collided, we ran out of memory.
  SP tracks the top of the stack.
  Grows downwards.
```
