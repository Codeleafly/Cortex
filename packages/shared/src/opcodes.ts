/**
 * Type-safe Opcodes for the Cortex VM.
 * These are numeric values for maximum performance.
 */
export enum Opcode {
    HALT = 0,
    PUSH = 1,
    ADD = 2,
    SUB = 3,
    MUL = 4,
    DIV = 5,
    LOAD = 6,
    STORE = 7,
    PRINT = 8,
    JMP = 9,
    JMP_IF_FALSE = 10,
    CMP_GT = 11,
    CMP_LT = 12,
    CMP_EQ = 13,
    POP = 14,
    PUSH_STR = 15,
    AND = 16,
    OR = 17,
    NOT = 18,
    RET = 19,
    CALL = 20,
}