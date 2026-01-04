const express = require('express')
const { WebSocketServer } = require('ws')
const http = require('http')
const path = require('path')

const PORT = process.env.PORT || 3000

function defaultSettings() {
  return {
    mode: 'duration',
    durHours: '0',
    durMinutes: '5',
    durSeconds: '0',
    targetTime: '',
    bgColor: '#000000',
    textColor: '#ffffff',
    timerSize: 20,
    fadeToBlackSeconds: 5,
    backgroundImageDataUrl: '',
    centerBlockEnabled: true,
    showStatus: false,
    messageText: '',
    messageSize: 4,
    alert1Enabled: false,
    alert1Minutes: 10,
    alert1Seconds: 0,
    alert1Bg: '#880000',
    alert1Text: '#ffffff',
    alert2Enabled: false,
    alert2Minutes: 5,
    alert2Seconds: 0,
    alert2Bg: '#ff0000',
    alert2Text: '#ffffff',
  }
}

let settings = defaultSettings()
let presets = []

const app = express()
app.use(express.json({ limit: '20mb' }))

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/display', (_req, res) => {
  res.sendFile(path.join(__dirname, 'display.html'))
})

app.get('/help', (_req, res) => {
  res.sendFile(path.join(__dirname, 'help.html'))
})

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/control' })

const VALID_ACTIONS = new Set(['start', 'pause', 'reset', 'stop', 'fullscreen'])

function broadcastMessage(payload) {
  const raw = JSON.stringify(payload)
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(raw)
    }
  })
}

function broadcastAction(action) {
  broadcastMessage({ type: 'action', action })
}

function broadcastSettings() {
  broadcastMessage({ type: 'settings', settings })
}

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'connected' }))
  socket.send(JSON.stringify({ type: 'settings', settings }))
})

app.get('/api/settings', (_req, res) => {
  res.json({ settings })
})

app.post('/api/settings', (req, res) => {
  const incoming = req.body?.settings
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ error: 'Invalid settings' })
  }
  settings = Object.assign(defaultSettings(), incoming)
  broadcastSettings()
  res.json({ ok: true, settings })
})

app.get('/api/presets', (_req, res) => {
  res.json({ presets })
})

app.post('/api/presets', (req, res) => {
  const incoming = req.body?.presets
  if (!Array.isArray(incoming)) {
    return res.status(400).json({ error: 'Invalid presets' })
  }
  presets = incoming
  res.json({ ok: true, presets })
})

app.post('/api/action', (req, res) => {
  const { action } = req.body || {}
  if (!VALID_ACTIONS.has(action)) {
    return res.status(400).json({ error: 'Invalid action' })
  }

  broadcastAction(action)
  res.json({ ok: true })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, actions: Array.from(VALID_ACTIONS) })
})

server.listen(PORT, () => {
  console.log(`Countdown server running on http://localhost:${PORT}`)
})
