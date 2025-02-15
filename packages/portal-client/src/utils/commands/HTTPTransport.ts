import { TransportProvider } from './types'

export class HTTPTransport implements TransportProvider {
	private readonly baseUrl: string
	private initialized: boolean = false

	constructor(baseUrl: string) {
			this.baseUrl = baseUrl
			console.log('HTTPTransport constructed with baseUrl:', baseUrl)
	}

	async initialize(): Promise<void> {
		console.log('Starting initialization...')
		try {
			const response = await this.sendCommand({
				method: 'initialize_socket',
				params: {}
			})

			console.log('Initialization response:', response)

			if (response.error) {
					throw new Error(response.error)
			}

			if (response.result?.status === 'success') {
				this.initialized = true
				console.log('Successfully initialized transport')
			} else {
				throw new Error('Initialization failed: unexpected response format')
			}
		} catch (error) {
			if (error instanceof Error) {
					throw new Error(`Failed to initialize transport: ${error.message}`)
			} else {
					throw new Error('Failed to initialize transport: Unknown error')
			}
		}
	}

	async sendCommand(request: { method: string; params?: any }): Promise<any> {
		console.log('Send called with method:', request.method, 'initialized:', this.initialized)
		
		if (!this.initialized && request.method !== 'initialize_socket') {	
			throw new Error('Transport not initialized')
		}

		try {
			const requestBody = {
				method: request.method,
				params: request.params || {}
			}
			
			const response = await fetch(`${this.baseUrl}/api/portal`, {
				method: 'POST',
				headers: {
						'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			})

			const responseText = await response.text()

			if (!response.ok) {
				try {
					const errorData = JSON.parse(responseText)
					throw new Error(errorData.error || 'Unknown error occurred')
				} catch (e) {
					throw new Error(`Server error: ${responseText}`)
				}
			}

			try {
				return JSON.parse(responseText)
			} catch (e) {
				throw new Error(`Failed to parse response: ${responseText}`)
			}
		} catch (error) {
			return {
				error: `Request failed: ${(error as Error).message}`
			}
		}
	}

	async portalRequest(method: string, params: any[] = []): Promise<any> {
		return this.sendCommand({
			method: 'portal_request',
			params: {
				method,
				params,
			}
		})
	}

	isInitialized(): boolean {
		return this.initialized
	}
}
