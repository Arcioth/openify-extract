<p align="center">
  <img src="icons/open1.png" alt="Openify Extract Logo" width="80">
</p>

<h1 align="center">Openify Extract</h1>

<p align="center">
  <strong>A truly simple, 100% free Chrome extension to extract your Spotify playlists.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-1db954?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/browser-chrome-blueviolet?style=flat-square" alt="Chrome">
</p>

---

Openify Extract is a privacy-first extension that lets you extract your Spotify playlists to CSV or JSON formats locally. No premium features, no limits, no bloat, just a floating button and straightforward exports. All processing happens in your browser — no data is sent to a backend.

## Features

- **Unlimited Extraction** — no daily limits or row limits.
- **Local Processing** — runs entirely in your browser.
- **Format Support** — export directly to CSV and JSON.
- **Virtualized Scrolling** — auto-updating counter as you scroll through large playlists.
- **Dynamic UI** — features a sleek, Spotify-themed interface with randomizing logo.

---

## Installation & Setup

### Developer Mode (Chrome/Edge/Brave)
1. Clone this repository or download the source code.
   ```bash
   git clone https://github.com/Arcioth/openify-extract.git
   ```
2. Open your Chromium-based browser and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top right corner).
4. Click **Load unpacked** and select the `openify-extract` folder from the cloned repository.

---

## Usage Guide

1. Go to the [Spotify Web Player](https://open.spotify.com/).
2. Navigate to the playlist you want to export.
3. Click the green **Extract Playlist** button floating in the bottom right corner.
4. **Scroll down slowly!** Spotify only loads a few songs at a time. The button will update its counter as it finds new songs while you scroll.
5. The extraction will finish automatically once you reach the bottom (or you can click the button again to finish early).
6. Click the extension icon in your browser toolbar to open the popup and download your data as CSV or JSON.

---

## License
[MIT](LICENSE)

<p align="center">Made by <a href="https://github.com/Arcioth">Arcioth</a></p>
