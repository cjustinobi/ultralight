
use crate::state::PortalState;
use tauri::State;
use tokio::net::UdpSocket;

pub async fn initialize_socket_inner(state: &PortalState) -> Result<(), String> {
    let mut socket_guard = state.socket.lock().await;
    if socket_guard.is_some() {
        return Ok(());
    }

    println!("Initializing UDP socket for Portal Network...");
    let socket = UdpSocket::bind("0.0.0.0:0").await.map_err(|e| {
        println!("Failed to bind socket: {}", e);
        e.to_string()
    })?;

    println!("Socket bound successfully to {}", socket.local_addr().map_err(|e| e.to_string())?);
    *socket_guard = Some(socket);
    Ok(())
}

#[tauri::command]
pub async fn initialize_socket(state: State<'_, PortalState>) -> Result<(), String> {
    initialize_socket_inner(&state).await
}