use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::net::UdpSocket;

#[derive(Clone)]
pub struct PortalState {
    pub(crate) socket: Arc<Mutex<Option<UdpSocket>>>,
}

impl PortalState {
    pub fn new() -> Self {
        Self {
            socket: Arc::new(Mutex::new(None)),
        }
    }
}

impl Default for PortalState {
    fn default() -> Self {
        Self::new()
    }
}