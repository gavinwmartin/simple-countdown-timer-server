import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base'
import got from 'got'

class CountdownInstance extends InstanceBase {
  constructor(internal) {
    super(internal)
    this.config = {}
  }

  async init(config) {
    this.config = config
    this.updateStatus(InstanceStatus.Ok)
    this.initActions()
  }

  async configUpdated(config) {
    this.config = config
    this.initActions()
  }

  getConfigFields() {
    return [
      {
        type: 'textinput',
        id: 'host',
        label: 'Control server host',
        width: 12,
        default: 'localhost',
        regex: '/^.+$/',
      },
      {
        type: 'number',
        id: 'port',
        label: 'Control server port',
        width: 6,
        default: 3000,
        min: 1,
        max: 65535,
      },
      {
        type: 'checkbox',
        id: 'ssl',
        label: 'Use HTTPS',
        default: false,
      },
      {
        type: 'number',
        id: 'timeout',
        label: 'Request timeout (ms)',
        width: 6,
        min: 500,
        max: 10000,
        default: 2000,
      },
    ]
  }

  initActions() {
    this.setActionDefinitions({
      start: {
        name: 'Start countdown',
        options: [],
        callback: () => this.sendAction('start'),
      },
      pause: {
        name: 'Pause countdown',
        options: [],
        callback: () => this.sendAction('pause'),
      },
      reset: {
        name: 'Reset countdown',
        options: [],
        callback: () => this.sendAction('reset'),
      },
      stop: {
        name: 'Stop countdown',
        options: [],
        callback: () => this.sendAction('stop'),
      },
      fullscreen: {
        name: 'Toggle fullscreen',
        options: [],
        callback: () => this.sendAction('fullscreen'),
      },
      test: {
        name: 'Test connection',
        options: [],
        callback: () => this.testConnection(),
      },
    })
  }

  async sendAction(action) {
    const url = this.buildActionUrl()
    const timeout = this.parseTimeout()

    try {
      await got.post(url, {
        json: { action },
        responseType: 'json',
        timeout: { request: timeout },
      })
      this.updateStatus(InstanceStatus.Ok)
    } catch (error) {
      this.log('error', `Failed to send ${action}: ${error.message}`)
      this.updateStatus(InstanceStatus.ConnectionFailure)
    }
  }

  async testConnection() {
    const url = this.buildHealthUrl()
    const timeout = this.parseTimeout()

    try {
      await got.get(url, {
        responseType: 'json',
        timeout: { request: timeout },
      })
      this.updateStatus(InstanceStatus.Ok)
      this.log('info', `Successfully reached countdown control server at ${url}`)
    } catch (error) {
      const statusCode = error?.response?.statusCode
      const statusDetail = statusCode ? ` (HTTP ${statusCode})` : ''
      this.log(
        'error',
        `Control server unreachable${statusDetail}: ${error.message}. Check host/port and whether display remote control is enabled.`,
      )
      this.updateStatus(InstanceStatus.ConnectionFailure, error.message)
    }
  }

  buildActionUrl() {
    const host = this.config.host?.trim() || 'localhost'
    const port = this.config.port || 3000
    const protocol = this.config.ssl ? 'https' : 'http'
    return `${protocol}://${host}:${port}/api/action`
  }

  buildHealthUrl() {
    const host = this.config.host?.trim() || 'localhost'
    const port = this.config.port || 3000
    const protocol = this.config.ssl ? 'https' : 'http'
    return `${protocol}://${host}:${port}/api/health`
  }

  parseTimeout() {
    const raw = Number(this.config.timeout)
    return Number.isFinite(raw) && raw > 0 ? raw : 2000
  }
}

runEntrypoint(CountdownInstance)
