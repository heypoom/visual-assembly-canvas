# Ideas

- Build key data structures and algorithms in the Rust runtime, e.g. our own `ArrayList` data structure is actually
  built on top of our own allocator and memory manager, which just operates on a single `[u16; 0xFFFF]`

- Then, build a language on top of that, which can invoke these algorithms and functions on our core runtime.

## 01: Contiguous Memory

```rust
static MEMORY: [u16; 0xFFFF] = [0; 0xFFFF];
```

## 02: Registers

We're going to have three 16-bit registers: `[u16; 0xF]`

```
FP: Frame Pointer. Stores the starting memory address of the stack frame.
SP: Stack Pointer. Keep track of the top of the stack.
PC: Program Counter. Keep track of the current instruction pointer.
```

### 03. Memory Layout

```
Code segment.
  Stores the program instructions.
  Read-only.

Data segment.
  Read-only.

Call stack.
  Read-write.

Stack memory.
  SP tracks the top of the stack.
  Read-write.
```

## 04: Assembly Format

The assembly text format should be able to parse the text into opcodes. We should be able to compile the assembly text
into bytecode.

For labels, we should build up a symbol table of the labels, then compute the memory addresses of the labels
(e.g. `[add_pattern]`) as we parse the text. Then, we can replace the labels with the memory addresses.

```
jump start

add_pattern:
    push 0xAA
    push 0xBB
    return

start:
    call add_pattern
    call add_pattern
```

In the above example, the symbol table has `add_pattern` at 0x02, and `start` at 0x07.

Another example is conditional jumps. We can build a loop using the following syntax.

```
push 0

loop_start:
    push 2
    add
    dup
    push 20
    greater_than_or_equal
    jump_not_zero loop_start

push 0xFF
```

## 05. Compile to Bytecode

We expose a bytecode compile and run mode.

`--compile` compiles the assembly text into bytecode, and writes the bytecode to a file.

`--run` runs the bytecode file.

## 06. String & Symbol Definition

```

```
