mod state;
mod handlers;
mod network;
mod types;
// mod utils;

pub use state::PortalState;
pub use handlers::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            
            let handle = app_handle.clone();
            std::thread::spawn(move || {
                network::http::start_http_server_sync(handle);
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            handlers::socket::initialize_socket,
            handlers::portal::portal_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}