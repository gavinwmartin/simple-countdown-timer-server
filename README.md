# Countdown Timer

## Overview

The countdown timer runs as a small server-based app. Settings and presets are stored centrally on the server and shared between any connected settings or display pages.

This is based of the original HTML only version of the countdown timer but adapted to be used with Bitfocus Companion.  [gavinwmartin/simple-countdown-timer-html](https://github.com/gavinwmartin/simple-countdown-timer-html).

## Setup

1. Install dependencies and start the server:
   ```bash
   npm install
   npm start
   ```
   The server starts on port `3000` by default.
2. Open the settings UI at `http://localhost:3000/` to configure your timer.
3. Launch the display at `http://localhost:3000/display` (or with the "Open countdown" button in the settings UI).

### General settings

The settings page loads with defaults that can be adjusted within the form. All changes are saved automatically back to the server. Available appearance tweaks include:

- Text and background colour
- Timer text size
- Optional centre block background or full-background image
- Optional message text and message size
- Status line toggle
- Fade-to-black delay after completion

### Alerts

Two alerts can be configured to change background/text colour as the countdown approaches zero.

### Presets

Presets are stored on the server:

1. Configure the timer
2. Enter a preset name and click **Save preset**
3. Load or delete presets via the dropdown

### Reset

Use **Reset to defaults** to restore the timer to its built-in defaults on the server.

## Usage

Once you are ready to use the timer, click **Open countdown (opens in new tab)**. The display page includes quick controls in the top bar:

- `Start` - starts the countdown
- `Pause` - holds the timer with the current countdown; starting again resumes from the paused time
- `Reset` - resets the countdown based on the latest saved settings
- `Fullscreen` - toggles fullscreen mode for the display

Keyboard shortcuts on the display:

- `Space` - start/pause toggle
- `F` - toggle fullscreen
- `R` - reset the timer to the latest saved settings

## Remote control and Companion module (optional)

The server exposes `/api/action` and a WebSocket bridge at `/control` for remote control. To drive the display from Bitfocus Companion:

1. Ensure the server is running (see setup above).
2. Open `/display?remote=1` at least once to opt the display into remote control; use `?remote=0` to disable.
3. In Companion, add the module from `companion-module/` and configure the host/port of your countdown server. Actions in Companion call the control API and forward commands to any open displays via WebSocket.

## Remote control and Companion module (optional)

The countdown timer still runs as a completely standalone set of static files. If you want to drive it from Bitfocus Companion, enable the optional control layer:

1. Install dependencies and start the control server (serves the HTML and exposes a WebSocket bridge):
   ```bash
   npm install
   npm start
   ```
   The server defaults to port `3000` and exposes `/api/action` for control requests.
2. Open `display.html` with remote control enabled (either once via query string or permanently after the first visit):
   - Add `?remote=1` to the URL when launching `display.html` (for example `http://localhost:3000/display.html?remote=1`).
   - The flag is remembered in `localStorage`; visit with `?remote=0` to disable again.
3. In the Companion UI, add the module from `companion-module/` and configure the host/port of your control server. Actions in Companion will call the control API, which forwards the commands to any open `display.html` instances (that opted into remote control) via WebSocket.

## License
This project is licensed under the MIT License — see the LICENSE file for details.
