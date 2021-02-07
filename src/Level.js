import WebSocket from 'ws'

export class Level {
	socketServer = new WebSocket.Server({ noServer: true })
	lastIdAssigned = 0
	clients = {}

	constructor(id) {
		this.id = id

		this.socketServer.on('connection', this.onConnection)
		this.socketServer.on('close', this.onClose)
	}

	handleIncomingConnection = (request, socket, head) => {
		this.socketServer.handleUpgrade(request, socket, head, (ws) => {
			this.socketServer.emit('connection', ws)
		})
	}

	onConnection = (socket) => {
		console.log('on connection')
		const id = `${++this.lastIdAssigned}`
		this.clients[id] = socket

		socket.on('message', (message) => {
			console.log('new message', message.toString())
			const data = JSON.parse(message.toString())
			if ('position' in data) {
				for (const [otherId, otherSocket] of Object.entries(this.clients)) {
					if (id !== otherId) {
						otherSocket.send(
							JSON.stringify({
								id,
								position: data.position,
								characterIndex: data.characterIndex,
							})
						)
					}
				}
			}
			this.socketServer
		})

		socket.on('close', () => {
			delete this.clients[id]
			for (const [otherId, otherSocket] of Object.entries(this.clients)) {
				otherSocket.send(
					JSON.stringify({
						id,
						left: true,
					})
				)
			}
		})
	}

	onClose = (socket) => {
		console.log('on close')
	}
}
