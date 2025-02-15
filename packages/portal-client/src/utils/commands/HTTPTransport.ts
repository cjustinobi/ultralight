import { TransportProvider } from './types'

export class HTTPTransport implements TransportProvider {
	private readonly baseUrl: string
	private initialized: boolean = false

	constructor(baseUrl: string) {
			this.baseUrl = baseUrl
	}

	async initialize(): Promise<void> {
		try {
			const response = await this.send({
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

	async send(request: any): Promise<any> {
		if (!this.initialized && request.method !== 'initialize_socket') {
				throw new Error('Transport not initialized')
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/portal`, {
				method: 'POST',
				headers: {
						'Content-Type': 'application/json',
				},
				body: JSON.stringify(request),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Unknown error occurred')
			}

			return await response.json()
		} catch (error) {
			return {
				error: `Request failed: ${(error as Error).message}`
			}
		}
	}
}
