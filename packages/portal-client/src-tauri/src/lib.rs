use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::net::UdpSocket;
use tauri::{State, Manager, AppHandle, Runtime};
use tauri::async_runtime::TokioRuntime;
use serde_json::{Value, json};
use tokio::time::{timeout, Duration};
use std::str;
use axum::{
    routing::post,
    Router,
    Json,
    extract::State as AxumState,
    http::StatusCode,
};
use std::net::SocketAddr;
use serde::{Deserialize, Serialize};


#[derive(Clone)]
pub struct PortalState {
    socket: Arc<Mutex<Option<UdpSocket>>>,
}

impl Default for PortalState {
    fn default() -> Self {
        Self {
            socket: Arc::new(Mutex::new(None)),
        }
    }
}

#[derive(Debug, Deserialize)]
struct PortalRequest {
    method: String,
    params: Value,
}

#[derive(Debug, Serialize)]
struct PortalResponse {
    result: Option<Value>,
    error: Option<String>,
}

async fn handle_portal_request(
    AxumState(state): AxumState<Arc<PortalState>>,
    Json(request): Json<PortalRequest>,
) -> Result<Json<PortalResponse>, (StatusCode, Json<PortalResponse>)> {
    let result = match request.method.as_str() {
        "initialize_socket" => {
            initialize_socket_inner(&state).await.map(|_| {
                json!({"status": "success"})
            })
        },
        "portal_request" => {
            portal_request_inner(&state, request.method, request.params).await
        },
        _ => Err("Unknown method".to_string())
    };

    match result {
        Ok(value) => Ok(Json(PortalResponse {
            result: Some(value),
            error: None,
        })),
        Err(e) => Err((
            StatusCode::BAD_REQUEST,
            Json(PortalResponse {
                result: None,
                error: Some(e),
            }),
        ))
    }
}

async fn initialize_socket_inner(state: &PortalState) -> Result<(), String> {
    let mut socket_guard = state.socket.lock().await;
    if socket_guard.is_some() {
        return Ok(());
    }

    println!("Initializing UDP socket for Portal Network...");
    let socket = UdpSocket::bind("0.0.0.0:9090").await.map_err(|e| {
        println!("Failed to bind socket: {}", e);
        e.to_string()
    })?;

    println!("Socket bound successfully to {}", socket.local_addr().map_err(|e| e.to_string())?);
    *socket_guard = Some(socket);
    Ok(())
}

async fn portal_request_inner(
    state: &PortalState,
    method: String,
    params: Value,
) -> Result<Value, String> {
    let request = json!({
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1,
    });
    
    let request_bytes = serde_json::to_vec(&request)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;

    send_bytes(state, request_bytes, "127.0.0.1:8545".into()).await?;
    let (response_bytes, _) = receive_bytes(state, 5000).await?;

    let response_str = str::from_utf8(&response_bytes)
        .map_err(|e| format!("Failed to decode response: {}", e))?;
    
    let response: Value = serde_json::from_str(response_str)
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(response)
}

#[tauri::command]
async fn initialize_socket(state: State<'_, PortalState>) -> Result<(), String> {
    initialize_socket_inner(&state).await
}

#[tauri::command]
async fn portal_request(
    state: State<'_, PortalState>,
    method: String,
    params: Value,
) -> Result<Value, String> {
    portal_request_inner(&state, method, params).await
}

async fn send_bytes(
    state: &PortalState,
    bytes: Vec<u8>,
    target: String,
) -> Result<(), String> {
    let socket_guard = state.socket.lock().await;
    let socket = socket_guard.as_ref().ok_or("Socket not initialized")?;
    
    socket.send_to(&bytes, &target).await
        .map_err(|e| format!("Failed to send bytes: {}", e))?;
    
    Ok(())
}

async fn receive_bytes(
    state: &PortalState,
    timeout_ms: u64,
) -> Result<(Vec<u8>, String), String> {
    let socket_guard = state.socket.lock().await;
    let socket = socket_guard.as_ref().ok_or("Socket not initialized")?;

    let mut buf = vec![0u8; 65535];
    
    match timeout(Duration::from_millis(timeout_ms), socket.recv_from(&mut buf)).await {
        Ok(Ok((len, addr))) => {
            buf.truncate(len);
            Ok((buf, addr.to_string()))
        }
        Ok(Err(e)) => Err(format!("Failed to receive bytes: {}", e)),
        Err(_) => Err("Receive timeout".to_string())
    }
}

fn start_http_server_sync<R: Runtime>(app_handle: AppHandle<R>) {
    let runtime = TokioRuntime::new().expect("Failed to create Tokio runtime");
    
    runtime.block_on(async {
        let state = Arc::new(PortalState::default());
        app_handle.manage(state.clone());
        
        let cors = tower_http::cors::CorsLayer::new()
            .allow_origin(tower_http::cors::Any)
            .allow_methods([http::Method::POST])
            .allow_headers([http::header::CONTENT_TYPE]);
        
        let app = Router::new()
            .route("/api/portal", post(handle_portal_request))
            .layer(cors)
            .with_state(state);

        let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
        println!("Starting HTTP server on {}", addr);
        
        match axum::serve(
            tokio::net::TcpListener::bind(addr)
                .await
                .expect("Failed to bind server"),
            app.into_make_service(),
        )
        .await
        {
            Ok(_) => println!("HTTP server stopped"),
            Err(e) => eprintln!("HTTP server error: {}", e),
        }
    });
}

async fn start_http_server<R: Runtime>(app_handle: AppHandle<R>) {
    let state = Arc::new(PortalState::default());
    app_handle.manage(state.clone());
    
    let cors = tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods([http::Method::POST])
        .allow_headers([http::header::CONTENT_TYPE]);
    
    let app = Router::new()
        .route("/api/portal", post(handle_portal_request))
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Starting HTTP server on {}", addr);
    
    match axum::serve(
        tokio::net::TcpListener::bind(addr)
            .await
            .expect("Failed to bind server"),
        app.into_make_service(),
    )
    .await
    {
        Ok(_) => println!("HTTP server stopped"),
        Err(e) => eprintln!("HTTP server error: {}", e),
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            
            let handle = app_handle.clone();
            std::thread::spawn(move || {
                start_http_server_sync(handle);
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            initialize_socket,
            portal_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
