use std::process::Command;
use std::path::Path;
use tauri::async_runtime::spawn;
use tauri::{App, AppHandle};
use crate::network::http::start_http_server_sync;

pub struct PortalProcess {
    child: Option<std::process::Child>,
}

impl PortalProcess {
    pub fn new() -> Self {
        Self { child: None }
    }

    pub fn start(&mut self, bind_port: u16, udp_port: u16) -> Result<(), String> {
        let binary_path = Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("binaries")
            .join("portal-client.js");

        if !binary_path.exists() {
            return Err("Portal client binary not found. Please run build script first.".to_string());
        }

        let child = Command::new("node")
            .arg("--experimental-modules")
            .arg("--no-warnings")
            .arg(binary_path)
            .env("BIND_PORT", bind_port.to_string())
            .env("UDP_PORT", udp_port.to_string())
            .spawn()
            .map_err(|e| format!("Failed to start portal process: {}", e))?;

        self.child = Some(child);
        Ok(())
    }

    pub fn stop(&mut self) -> Result<(), String> {
        if let Some(mut child) = self.child.take() {
            child.kill().map_err(|e| format!("Failed to stop portal process: {}", e))?;
        }
        Ok(())
    }
}

pub fn setup_portal_process(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle();
    
    // Start Portal process in a separate thread
    spawn(async move {
        let mut portal = PortalProcess::new();
        if let Err(e) = portal.start(9090, 8545) {
            eprintln!("Failed to start portal process: {}", e);
        }
    });
    
    // Start HTTP server
    start_http_server_in_thread(app_handle.clone());
    
    Ok(())
}

fn start_http_server_in_thread(handle: AppHandle) {
    std::thread::spawn(move || {
        start_http_server_sync(handle);
    });
}
