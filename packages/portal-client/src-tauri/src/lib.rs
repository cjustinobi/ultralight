mod state;
mod handlers;
mod network;
mod types;
mod portal_process;

pub use state::PortalState;
pub use handlers::*;
use portal_process::setup_portal_process;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(setup_portal_process)
        .invoke_handler(tauri::generate_handler![
            handlers::socket::initialize_socket,
            handlers::portal::portal_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}