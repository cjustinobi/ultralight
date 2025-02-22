pub mod error {
    use std::fmt;

    #[derive(Debug)]
    pub enum PortalError {
        ProcessError(String),
        SocketError(String),
        InvalidParameter(String),
    }

    impl fmt::Display for PortalError {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            match self {
                PortalError::ProcessError(msg) => write!(f, "Process error: {}", msg),
                PortalError::SocketError(msg) => write!(f, "Socket error: {}", msg),
                PortalError::InvalidParameter(msg) => write!(f, "Invalid parameter: {}", msg),
            }
        }
    }
}