import { spawn, type ChildProcess } from 'node:child_process'

const SERVER_URL = 'http://127.0.0.1:6173'

async function globalSetup() {
  if (await isServerReady()) {
    return
  }

  const server = spawn(
    process.execPath,
    ['scripts/playwright-vite-server.mjs'],
    {
      cwd: process.cwd(),
      stdio: 'ignore',
      windowsHide: true,
    },
  )

  await waitForServer(server)

  return async () => {
    await stopServer(server)
  }
}

async function waitForServer(server: ChildProcess) {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Vite server exited before becoming ready: ${server.exitCode}`)
    }

    if (await isServerReady()) return
    await delay(250)
  }

  throw new Error(`Timed out waiting for ${SERVER_URL}`)
}

async function isServerReady() {
  try {
    const response = await fetch(SERVER_URL)
    return response.ok
  } catch {
    return false
  }
}

async function stopServer(server: ChildProcess) {
  if (server.exitCode !== null) return

  server.kill('SIGTERM')
  const stopped = await waitForExit(server, 1_500)
  if (stopped) return

  if (process.platform === 'win32' && server.pid) {
    spawn('taskkill', ['/pid', String(server.pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
    })
  } else {
    server.kill('SIGKILL')
  }
}

function waitForExit(server: ChildProcess, timeoutMs: number) {
  return new Promise<boolean>(resolve => {
    const timer = setTimeout(() => {
      cleanup()
      resolve(false)
    }, timeoutMs)

    const onExit = () => {
      cleanup()
      resolve(true)
    }

    function cleanup() {
      clearTimeout(timer)
      server.off('exit', onExit)
    }

    server.once('exit', onExit)
  })
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default globalSetup
