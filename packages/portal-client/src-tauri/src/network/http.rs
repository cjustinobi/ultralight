use axum::{
    routing::post,
    Router,
    Json,
    extract::State as AxumState,
    http::StatusCode,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tauri::{Runtime, AppHandle, Manager};
use serde_json::{json};
use crate::state::PortalState;
use crate::types::{request::PortalRequest, response::PortalResponse};
use crate::handlers::{socket, portal};

async fn handle_portal_request(
    AxumState(state): AxumState<Arc<PortalState>>,
    Json(request): Json<PortalRequest>,
) -> Result<Json<PortalResponse>, (StatusCode, Json<PortalResponse>)> {
    let result = match request.method.as_str() {
        "initialize_socket" => {
            socket::initialize_socket_inner(&state).await.map(|_| {
                json!({"status": "success"})
            })
        },
        "portal_request" => {
            portal::portal_request_inner(&state, request.method, request.params).await
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

pub fn start_http_server_sync<R: Runtime>(app_handle: AppHandle<R>) {
    let runtime = tauri::async_runtime::TokioRuntime::new()
        .expect("Failed to create Tokio runtime");
    
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