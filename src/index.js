import express from 'express'
import http from 'http'
import url from 'url'
import { Level } from './Level.js'

console.log('Starting server')

const port = parseInt(process.env.PORT || '', 10) || 8080

const app = express()

const server = http.createServer(app)

const levels = []

app.get('/', (request, response) => {
	response.redirect('https://matematicke-bludiste.vercel.app')
})

server.on('upgrade', (request, socket, head) => {
	const { pathname } = url.parse(request.url)

	const match = pathname && pathname.match(/\/level\/(.*)\.ws/)
	const levelId = match ? match[1] : null

	if (levelId) {
		// @TODO: release unused level from memory
		const level =
			levels.find((level) => levelId === level.id) ||
			(() => {
				const newLevel = new Level(levelId)
				levels.push(newLevel)
				return newLevel
			})()

		level.handleIncomingConnection(request, socket, head)
	} else {
		socket.destroy()
	}
})

server.listen(port, () => {
	console.log(`Server started on port ${port}`)
})
