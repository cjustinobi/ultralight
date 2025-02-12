use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::async_runtime::spawn;
use tokio::net::UdpSocket;
use tauri::{State, Manager, AppHandle};
use serde_json::{Value, json};
use tokio::time::{timeout, Duration};
use std::str;

struct PortalState {
    socket: Arc<Mutex<Option<UdpSocket>>>,
}

#[tauri::command]
async fn initialize_socket(state: State<'_, PortalState>) -> Result<(), String> {
    let mut socket_guard = state.socket.lock().await;
    if socket_guard.is_some() {
        return Ok(());
    }

    println!("Initializing UDP socket for Portal Network...");
    let socket = UdpSocket::bind("127.0.0.1:9090").await.map_err(|e| {
        println!("Failed to bind socket: {}", e);
        e.to_string()
    })?;

    println!("Socket bound successfully to {}", socket.local_addr().map_err(|e| e.to_string())?);
    *socket_guard = Some(socket);
    Ok(())
}

#[tauri::command]
async fn send_bytes(
    state: State<'_, PortalState>,
    bytes: Vec<u8>,
    target: String,
) -> Result<(), String> {
    let socket_guard = state.socket.lock().await;
    let socket = socket_guard.as_ref().ok_or("Socket not initialized")?;

    println!("Sending {} bytes to {}", bytes.len(), target);
    socket.send_to(&bytes, &target).await
        .map_err(|e| format!("Failed to send bytes: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn receive_bytes(
    state: State<'_, PortalState>,
    timeout_ms: u64,
) -> Result<(Vec<u8>, String), String> {
    let socket_guard = state.socket.lock().await;
    let socket = socket_guard.as_ref().ok_or("Socket not initialized")?;

    let mut buf = vec![0u8; 65535];
    
    match timeout(Duration::from_millis(timeout_ms), socket.recv_from(&mut buf)).await {
        Ok(Ok((len, addr))) => {
            buf.truncate(len);
            println!("Received {} bytes from {}", len, addr);
            Ok((buf, addr.to_string()))
        }
        Ok(Err(e)) => {
            Err(format!("Failed to receive bytes: {}", e))
        }
        Err(_) => {
            Err("Receive timeout".to_string())
        }
    }
}

#[tauri::command]
async fn portal_request(
    state: State<'_, PortalState>,
    method: String,
    params: Vec<Value>,
) -> Result<Value, String> {
    let request = json!({
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1,
    });
    
    let request_bytes = serde_json::to_vec(&request)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;

    send_bytes(state.clone(), request_bytes, "127.0.0.1:8545".into()).await?;

    let (response_bytes, _) = receive_bytes(state.clone(), 5000).await?;

    let response_str = str::from_utf8(&response_bytes)
        .map_err(|e| format!("Failed to decode response: {}", e))?;
    
    let response: Value = serde_json::from_str(response_str)
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(response)
}

#[tauri::command]
async fn send_portal_message(
    state: State<'_, PortalState>,
    message: Vec<u8>,
    target_addr: String,
) -> Result<(), String> {
    println!("Sending message to {}...", target_addr);
    let socket_guard = state.socket.lock().await;
    if let Some(socket) = socket_guard.as_ref() {

        socket.send_to(&message, &target_addr).await.map_err(|e| {
            println!("Failed to send message: {}", e);
            format!("Failed to send message: {}", e)
        })?;
        println!("Message sent successfully!");
        Ok(())
    } else {
        println!("Socket not initialized");
        Err("Socket not initialized".to_string())
    }
}

#[tauri::command]
async fn receive_portal_message(
    state: State<'_, PortalState>,
) -> Result<(Vec<u8>, String), String> {
    println!("Receiving message...");
    let socket_guard = state.socket.lock().await;
    if let Some(socket) = socket_guard.as_ref() {
        let mut buf = vec![0u8; 65535];
        println!("Waiting for data...");

        match timeout(Duration::from_secs(5), socket.recv_from(&mut buf)).await {
            Ok(Ok((size, addr))) => {
                println!("Received {} bytes from {}", size, addr);
                buf.truncate(size);
                println!("Message received successfully!");
                Ok((buf, addr.to_string()))
            }
            Ok(Err(e)) => {
                println!("Failed to receive message: {}", e);
                Err(format!("Failed to receive message: {}", e))
            }
            Err(_) => {
                println!("Timeout: No data received");
                Err("Timeout: No data received".to_string())
            }
        }
    } else {
        println!("Socket not initialized");
        Err("Socket not initialized".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let portal_state = PortalState {
        socket: Arc::new(Mutex::new(None)),
    };

    tauri::Builder::default()
        .manage(portal_state)
        .invoke_handler(tauri::generate_handler![
            initialize_socket,
            send_portal_message,
            receive_portal_message,
            portal_request
        ])
        .setup(|app| {
            let handle: AppHandle = app.handle().clone();

            spawn(async move {
                if let Some(state) = handle.try_state::<PortalState>() {
                    if let Err(e) = initialize_socket(state).await {
                        eprintln!("Failed to initialize socket: {}", e);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}