# From Opcodes to Algorithms in Rust

An attempt to implement the most basic build blocks such as memory management, registers, assembly-like instruction
sets, compilers, interpreters, up to data structures and algorithms, all the way up to working programs.

Let's build it all from scratch in Rust, building one on top of another! For educational purposes, of course.

## Checklist

- [x] Linear Memory
- [x] Registers (PC, SP)
- [x] Instruction: PUSH
- [x] Instruction: POP
- [x] Fetch-Decode-Execute Cycle
- [x] Instruction: DUP, SWAP, OVER
- [x] Instruction: INC, DEC
- [x] Instruction: ADD, SUB, MUL, DIV
- [x] Instruction: JUMP, JUMP_ZERO, JUMP_NOT_ZERO
- [x] Instruction: HALT
- [x] Instruction: LOAD, STORE
- [ ] Char
- [ ] String
- [ ] IO.read, IO.write
- [ ] Hello World
- [ ] Palindrome
- [ ] Array
- [ ] ArrayList
- [ ] Linked List
- [ ] Doubly Linked List
- [ ] Ring Buffer
- [ ] Graph
- [ ] Depth-First Search
- [ ] Breadth-First Search
- [ ] Binary Tree
- [ ] Binary Search Tree

## Implementation Ideas

- Build key data structures and algorithms in the Rust runtime, e.g. our own `ArrayList` data structure is actually
  built on top of our own allocator and memory manager, which just operates on a single `[u16; 0xFFFF]`

- Then, build a language on top of that, which can invoke these algorithms and functions on our core runtime.
