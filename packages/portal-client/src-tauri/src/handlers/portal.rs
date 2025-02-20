// use crate::state::PortalState;
// use crate::network::udp::{send_bytes, receive_bytes};
// use serde_json::{Value, json};
// use tauri::State;
// use std::str;

// pub async fn portal_request_inner(
//     state: &PortalState,
//     method: String,
//     params: Value,
// ) -> Result<Value, String> {
//     println!("Received portal request: method={}, params={:?}", method, params);
//     let actual_method = params["method"].as_str()
//         .ok_or("Missing 'method' in params")?;
//     let actual_params = params["params"].clone();
//     let request = json!({
//         "jsonrpc": "2.0",
//         "method": actual_method,
//         "params": actual_params,
//         "id": 1,
//     });
    
//     let request_bytes = serde_json::to_vec(&request)
//         .map_err(|e| format!("Failed to serialize request: {}", e))?;

//     println!("Sending {} bytes to 127.0.0.1:8545", request_bytes.len());
//     send_bytes(state, request_bytes, "127.0.0.1:8545".into()).await?;
//     println!("Bytes sent successfully, waiting for response...");
//     let (response_bytes, _) = receive_bytes(state, 5000).await?;
//     println!("Received {} bytes", response_bytes.len());

//     let response_str = str::from_utf8(&response_bytes)
//         .map_err(|e| format!("Failed to decode response: {}", e))?;
    
//     let response: Value = serde_json::from_str(response_str)
//         .map_err(|e| format!("Failed to parse response: {}", e))?;

//     Ok(response)
// }

// #[tauri::command]
// pub async fn portal_request(
//     state: State<'_, PortalState>,
//     method: String,
//     params: Value,
// ) -> Result<Value, String> {
//     portal_request_inner(&state, method, params).await
// }

// src/handlers/portal.rs
use crate::state::PortalState;
use crate::network::udp::{send_bytes, receive_bytes};
use serde_json::{Value, json};
use tauri::State;
use std::str;

pub async fn portal_request_inner(
    state: &PortalState,
    method: String,
    params: Value,
) -> Result<Value, String> {
    println!("Received portal request: method={}, params={:?}", method, params);
    let actual_method = params["method"].as_str()
        .ok_or("Missing 'method' in params")?;
        
    // Extract and flatten the parameters
    let actual_params = match params["params"].as_array() {
        Some(array) => {
            // If the first element is an array, flatten it
            if array.len() == 1 && array[0].is_array() {
                array[0].as_array()
                    .unwrap_or(&Vec::new())
                    .clone()
            } else {
                array.clone()
            }
        },
        None => Vec::new(),
    };

    let request = json!({
        "jsonrpc": "2.0",
        "method": actual_method,
        "params": actual_params,
        "id": 1,
    });
    
    let request_bytes = serde_json::to_vec(&request)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;

    println!("Sending request: {}", serde_json::to_string_pretty(&request).unwrap());
    println!("Sending {} bytes to 127.0.0.1:8545", request_bytes.len());
    
    send_bytes(state, request_bytes, "127.0.0.1:8545".into()).await?;
    println!("Bytes sent successfully, waiting for response...");
    let (response_bytes, _) = receive_bytes(state, 5000).await?;
    println!("Received {} bytes", response_bytes.len());

    let response_str = str::from_utf8(&response_bytes)
        .map_err(|e| format!("Failed to decode response: {}", e))?;
    
    let response: Value = serde_json::from_str(response_str)
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(response)
}

#[tauri::command]
pub async fn portal_request(
    state: State<'_, PortalState>,
    method: String,
    params: Value,
) -> Result<Value, String> {
    portal_request_inner(&state, method, params).await
}