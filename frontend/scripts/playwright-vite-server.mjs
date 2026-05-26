import { createServer } from 'vite'

const server = await createServer({
  server: {
    host: '127.0.0.1',
    port: 6173,
    strictPort: true,
  },
})

await server.listen()
server.printUrls()

let closing = false

async function shutdown() {
  if (closing) return
  closing = true
  await server.close()
  process.exit(0)
}

process.on('SIGINT', () => {
  void shutdown()
})

process.on('SIGTERM', () => {
  void shutdown()
})
