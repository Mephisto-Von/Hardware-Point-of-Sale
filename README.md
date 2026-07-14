# Hardware Point of Sale

[![Release](https://img.shields.io/github/v/release/Mephisto-Von/Hardware-Point-of-Sale)](https://github.com/Mephisto-Von/Hardware-Point-of-Sale/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/Mephisto-Von/Hardware-Point-of-Sale/total)](https://github.com/Mephisto-Von/Hardware-Point-of-Sale/releases/latest)

Desktop Point of Sale app for hardware stores built with Electron.

## Download

| Installer | Description | Link |
|-----------|-------------|------|
| <img src="https://img.icons8.com/color/24/000000/windows-10.png" width="16"/> `Setup.exe` | NSIS installer (recommended) | [Download](https://github.com/Mephisto-Von/Hardware-Point-of-Sale/releases/latest/download/HardwarePOS.Setup.0.1.0.exe) |
| <img src="https://img.icons8.com/color/24/000000/windows-10.png" width="16"/> `Portable.exe` | Portable — no installation needed | [Download](https://github.com/Mephisto-Von/Hardware-Point-of-Sale/releases/latest/download/HardwarePOS.0.1.0.exe) |
| 🌐 Web App | Run in any browser (no install) | `npm install && node server.js` |

> Default login: **admin** / **admin**

## Features

- Multi-user network support with a central database
- Receipt printing (thermal 80mm & A4)
- Barcode scanning and search
- Staff accounts with granular permissions
- Products and categories management
- Stock management
- Open tabs (hold orders)
- Customer database
- Transaction history with filters (date, till, cashier, status)

## Quick Start (Web)

```bash
npm install
node server.js
```

Open **http://localhost:8001** in a browser.

## Desktop App (Electron)

Requires a display environment (Windows, macOS, or Linux with X11/Wayland):

```bash
npm run electron
```

## Build from Source

```bash
npm install
npm run electron-build -- --win
```

Output in `release/`:

| File | Description |
|------|-------------|
| `HardwarePOS Setup 0.1.0.exe` | NSIS installer |
| `HardwarePOS 0.1.0.exe` | Portable (single-file) |

## Project Structure

```
├── server.js          Express API server (port 8001)
├── start.js           Electron entry point
├── index.html         Frontend UI
├── renderer.js        Renderer entry
├── assets/            CSS, JS, images, plugins
│   └── js/
│       ├── pos.js            Main POS logic
│       └── product-filter.js Product filtering
├── api/               REST API routes
│   ├── inventory.js
│   ├── customers.js
│   ├── categories.js
│   ├── transactions.js
│   ├── settings.js
│   └── users.js
├── data/              Local database & uploads (auto-created)
└── release/           Build output
```
