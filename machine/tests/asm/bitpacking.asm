.value LEN 4
.value PACKED_PTR 0x5000

push 0
store PACKED_PTR ; *packed_ptr = 0
push 0 ; [i = 0]

loop:
  dup          ; [i, i]
  push 0x2000  ; [i, i, 0x2000]
  add          ; [i, 0x20XX]
  read 1       ; [i, A]

  load PACKED_PTR
  push 1
  left_shift
  swap
  or
  store PACKED_PTR

  swap         ; [A, i]
  inc          ; [A, i + 1]
  dup          ; [A, i, i]
  push LEN     ; [A, i, i, MAX]

  greater_than_or_equal ; MAX >= i
  jump_zero loop ; [i]
  pop ; discard [i]
  load PACKED_PTR ; load the packed number
