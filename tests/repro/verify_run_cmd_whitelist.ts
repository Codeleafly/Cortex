import { VM } from '../../packages/runtime/src/vm/VM.js';
import { Opcode } from '../../packages/shared/src/opcodes.js';

const vm = new VM({}, false); // Non-interactive
vm.addWhitelist('run', '/bin/ls');

try {
    console.log("Testing 'ls'...");
    vm.run(new Int32Array([
        Opcode.PUSH_STR, 0,
        Opcode.RUN_CMD,
        Opcode.HALT
    ]), ['/bin/ls']);
    console.log("Success");
} catch (e) {
    console.log("Failed:", e.message);
}

try {
    console.log("Testing 'ls -la'...");
    vm.run(new Int32Array([
        Opcode.PUSH_STR, 0,
        Opcode.RUN_CMD,
        Opcode.HALT
    ]), ['/bin/ls -la']);
    console.log("Success");
} catch (e) {
    console.log("Failed:", e.message);
}
