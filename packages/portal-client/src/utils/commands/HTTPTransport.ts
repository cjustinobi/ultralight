import { TransportProvider } from './types'

interface PortalNetworkConfig {
	portalHost?: string;
	portalPort?: number;
	timeoutMs?: number;
}

export class HTTPTransport implements TransportProvider {
	private readonly baseUrl: string
	private readonly portalHost: string
	private readonly portalPort: number
	private readonly timeoutMs: number
	private initialized: boolean = false

	constructor(baseUrl: string, config: PortalNetworkConfig = {}) {
		this.baseUrl = baseUrl
		this.portalHost = config.portalHost || '127.0.0.1'
		this.portalPort = config.portalPort || 8545
		this.timeoutMs = config.timeoutMs || 10000
	}

	async initialize(): Promise<void> {
		try {
			const response = await this.sendCommand({
				method: 'initialize_socket',
				params: {}
			})

			if (response.error) {
				throw new Error(response.error)
			}

			this.initialized = true
	} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to initialize transport: ${error.message}`)
			} else {
				throw new Error('Failed to initialize transport: Unknown error')
			}
		}
	}

	async sendCommand(request: { method: string; params?: any }): Promise<any> {
		if (!request.method) {
			throw new Error('Method name is required')
		}

		if (!this.initialized && request.method !== 'initialize_socket') {
			throw new Error('Transport not initialized')
		}

		try {
			const requestBody = {
				method: request.method,
				params: request.params || {}
			}
			
			console.log('Sending Portal Network request:', JSON.stringify(requestBody, null, 2))
			
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs)

			const response = await fetch(`${this.baseUrl}/api/portal`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal
			})

			clearTimeout(timeoutId)

			const responseText = await response.text()
			console.log('Portal Network response:', responseText)

			if (!response.ok) {
				try {
					const errorData = JSON.parse(responseText)
					throw new Error(errorData.error || 'Unknown error occurred')
				} catch (e) {
					throw new Error(`Server error: ${responseText}`)
				}
			}

			const responseData = JSON.parse(responseText)
			
			if (responseData.error === 'Receive timeout') {
				throw new Error(`Portal Network node at ${this.portalHost}:${this.portalPort} did not respond within ${this.timeoutMs}ms. Please ensure the Portal Network node is running and accessible.`)
			}
			return responseData
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					return {
						error: `Request timed out after ${this.timeoutMs}ms`
					}
				}
				return {
					error: `Request failed: ${error.message}`
				}
			}
			return {
				error: 'Request failed: Unknown error'
			}
		}
	}

	async portalRequest(method: string, params: any[] = []): Promise<any> {
		return this.sendCommand({
			method: 'portal_request',
			params: {
				method,
				params
			}
		})
	}
}
