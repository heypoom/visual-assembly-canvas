# Visual Assembly Canvas

> [!IMPORTANT]
> Visual Assembly Canvas is currently **unmaintained**, as we have ported the full functionality of visual assembly canvas to [Patchies](https://github.com/heypoom/patchies), the spiritual successor of this project! The virtual machine is brought to Patchies as-is, so it has full feature parity, including line-by-line highlights and memory region visualizer. Check out its [repo](https://github.com/heypoom/patchies) and [webapp](https://patchies.app) - it's free, open source, much more powerful and even easier to use.

![Screenshot of Visual Assembly Canvas](./docs/images/canvas-1.jpg)

A highly visual assembly editor, infinite canvas for wiring blocks and machines together, bytecode virtual machine runnable natively and on WebAssembly, and a command-line bytecode compiler.

## Logbook

See my journal of design decisions and daily progress in my [digital garden page](https://poom.dev/from-opcodes-to-algorithms).

## Part of the "From Opcodes to Algorithms" project

From Opcodes to Algorithms is my 100-day project to implement the most basic build blocks such as memory management, registers, assembly-like instruction sets, compilers, interpreters, up to data structures, algorithms, all the way up to working programs. Maybe even operating systems and neural networks in the future.Let's build it all from scratch in Rust, building one on top of another!

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
- [x] Char
- [x] String
- [x] Print
- [x] Hello World
- [x] Simple Call Stack
- [x] Instruction: CALL, RETURN
- [x] Scanner and Parser
- [x] Assembler
- [x] Bytecode Compiler
- [x] Command Line Compiler/Interpreter
- [x] Node-based Visual Editor
- [x] Actor Model, Mailboxes and Machine Queues
- [x] Native Orchestrator
- [x] WebAssembly-based Orchestrator using Actor Model
- [x] Basic Run and Step
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
