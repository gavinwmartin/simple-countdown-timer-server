# Countdown Timer Companion Module

This module targets the simple countdown timer display and exposes actions for fullscreen, reset, pause, stop, and start. The countdown itself still runs as static HTML; the module only requires the optional `control-server.js` from the project root when you want to enable remote control.

To use this module you need Bitfocus Companion 3.x. Install it as a user module by copying the `companion-module` folder into your Companion user modules directory (typically `%APPDATA%/Companion/modules` on Windows or `~/Library/Application Support/Companion/modules` on macOS) and restart Companion. Once Companion reloads it should discover the module automatically.

## Configuration

1. Run the countdown timer with the control server (`npm start`) so that the API is reachable on the configured host and port (defaults to port 3000). Open `display.html` with `?remote=1` (or after storing that flag via a prior visit) so the display listens for Companion control.
2. In Companion, add this module and configure:
   - **Host**: Address of the machine running the control server.
   - **Port**: Port number for the control server (default `3000`).
   - **Use HTTPS**: Enable if the control server is published over HTTPS (otherwise HTTP is used).
   - **Request timeout**: Optional override for how long Companion waits for a response when sending actions.

## Actions

- **Start Countdown**
- **Pause Countdown**
- **Reset Countdown**
- **Stop Countdown**
- **Toggle Fullscreen**
- **Test Connection** – sends a request and reports success/failure, useful for validating host/port/SSL settings

Countdown control actions issue an HTTP POST to `/api/action` on the control server, which then broadcasts the command to any open display clients via WebSocket. The **Test Connection** action calls `/api/health` and simply verifies that the server responds.
