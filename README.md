# From Opcodes to Algorithms in Rust

An attempt to implement the most basic build blocks such as memory management, registers, assembly-like instruction sets, compilers, interpreters, up to data structures and algorithms, all the way up to working programs.

Let's build it all from scratch in Rust, building one on top of another! For educational purposes, of course.

## Checklist

- [x] [Memory](./src/mem/mod.rs)
- [x] Dumb Allocator
- [ ] Registers
- [ ] Machine Opcode
- [ ] Instruction: MOV
- [ ] Hello World
- [ ] Palindrome
- [ ] Array
- [ ] String
- [ ] ArrayList
- [ ] Linked List
- [ ] Doubly Linked List
- [ ] Ring Buffer
- [ ] Graph
- [ ] Depth First Search
- [ ] Breadth First Search
- [ ] Binary Tree
- [ ] Binary Search Tree

## Implementation Ideas

- Build key data structures and algorithms in the Rust runtime, e.g. our own `ArrayList` data structure is actually built on top of our own allocator and memory manager, which just operates on a single `[u8; 0xFFFF]`

- Then, build a language on top of that, which can invoke these algorithms and functions on our core runtime.
