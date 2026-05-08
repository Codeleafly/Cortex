pub mod math;
pub mod io;
pub mod control_flow;
pub mod memory;

pub use math::execute_math;
pub use io::execute_io;
pub use control_flow::execute_control;
pub use memory::execute_memory_and_core;