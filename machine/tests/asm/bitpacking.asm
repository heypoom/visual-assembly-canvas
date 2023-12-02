push 1
push 0
push 1
push 0
push 1

push 0 ; accumulator
push 5 ; pack 5 bits

pack_loop:
  dup
  jump_zero pack_end
  swap
  pop
  swap
  push 1
  left_shift
  or
  swap
  dec
  swap
  jump pack_loop

pack_end:
  push 0xDEAD