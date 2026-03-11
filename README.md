Here is the updated `README.md` with a dedicated **Core Dependencies** section that includes the Rust crates used to power the backend, so anyone contributing to or building your project knows exactly what makes it tick.

# ⬡ NetSpy v2.0 — Command Center

NetSpy is a Android network monitor tool built with **Rust** and **Tauri v2**. It connects directly to your Android device via ADB to capture, parse, and analyze application network traffic, API calls, and security risks in real-time, all within a lightning-fast native desktop application.

---



## 🧱 Core Dependencies

### Frontend

- **Vanilla HTML/CSS/JS:** Zero-build frontend for maximum performance and instant load times.
- **Tauri API (`@tauri-apps/api`):** Injected globally to handle secure IPC communication with Rust.

### Backend (Rust Crates)

- **`tauri` (v2.0):** The core desktop application framework.
- **`tokio`:** Asynchronous runtime for handling non-blocking ADB logcat streams and background daemon tasks.
- **`regex` & `lazy_static`:** High-performance pattern matching compiled once at startup for blazing-fast packet parsing.
- **`serde` & `serde_json`:** For serializing Rust structs into JSON to send over the Tauri event bridge.
- **`dotenvy`:** Environment variable management (loading dynamic ports from `.env`).
- **`chrono`:** Precise timestamp generation for network packets.

---

## 🛠️ Prerequisites

Before you begin, you must install the core dependencies for your specific operating system. NetSpy requires **Node.js**, **Rust**, and the **Android Debug Bridge (ADB)**.

### 🍎 macOS

The easiest way to install dependencies on macOS is using [Homebrew](https://brew.sh/):

```bash
# Install Node, Rust, and ADB
brew install node rust android-platform-tools
```

### 🪟 Windows

1. **Node.js:** Download and install from [nodejs.org](https://nodejs.org/).
2. **Rust:** Download and run `rustup-init.exe` from [rustup.rs](https://rustup.rs/). Follow the default prompts. _(Requires C++ Build Tools when prompted)._
3. **ADB:** Download the [Android SDK Platform-Tools](https://developer.android.com/tools/releases/platform-tools). Extract the folder and **add it to your Windows System PATH**.

### 🐧 Linux (Ubuntu / Debian)

```bash
# 1. Install Node.js and ADB
sudo apt update
sudo apt install nodejs npm adb

# 2. Install Rust
curl --proto '=https' --tlsv1.2 -sSf [https://sh.rustup.rs](https://sh.rustup.rs) | sh

# 3. Install Tauri Linux System Dependencies
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

```

---

## 🚀 Installation & Setup

1. **Clone the repository and navigate into it:**

```bash
git clone [https://github.com/yourusername/netspy-tauri.git](https://github.com/yourusername/netspy-tauri.git)
cd netspy-tauri

```

2. **Install Node dependencies:**
   _(This installs the Tauri CLI needed to run the app)_

```bash
npm install

```

3. **Set up the Environment File:**
   The Rust backend requires a `.env` file to dynamically configure the internal port. Create a file named `.env` inside the `src-tauri` folder:

```bash
# Create src-tauri/.env and add the following line:
NETSPY_PORT=7474

```

---

## 💻 Running the App (Development Mode)

To start the application with hot-reloading enabled:

```bash
npm run tauri dev

```

_(Note: The very first time you run this command, it will take a few minutes to download and compile the Rust crates. Subsequent runs will launch almost instantly.)_

### How to use:

1. Ensure your Android device has **USB Debugging** enabled in Developer Options.
2. Connect the device to your computer via USB.
3. Open NetSpy and select your device from the dropdown menu.
4. Click **▶ START** to begin capturing traffic.

---

## 📦 Building for Production

To compile NetSpy into a standalone native executable (`.exe`, `.app`, `.AppImage`) that you can share or install on other computers without needing Node.js or Rust installed:

```bash
npm run tauri build

```

The compiled installers will be generated inside the `src-tauri/target/release/bundle/` directory.

---

## 🛑 Troubleshooting

**1. "No devices found" or App stays OFFLINE:**

- Ensure your phone is plugged in and unlocked.
- Check your phone screen for an "Allow USB Debugging?" prompt and click "Always allow from this computer".
- **Windows Users:** Open a terminal and type `adb devices`. If it says "command not found", you have not properly added the Android Platform Tools folder to your System Environment PATH.

**2. App crashes or shows a blank screen on startup:**

- Ensure your `src-tauri/tauri.conf.json` has `"withGlobalTauri": true` inside the `"app"` configuration block.
- Ensure your `src-tauri/.env` file exists and has a valid port number.

**3. "cargo: command not found" (Mac/Linux):**

- Your terminal hasn't loaded Rust yet. Run `source "$HOME/.cargo/env"` or restart your terminal window.

---

## 📂 Project Architecture

```text
netspy-tauri/
├── frontend/                 # Vanilla HTML/JS/CSS Frontend
│   └── index.html
└── src-tauri/                # Rust Backend (Tauri Core)
    ├── src/
    │   ├── adb.rs            # ADB connection & device daemon
    │   ├── parser.rs         # High-speed Regex log parser
    │   ├── lib.rs            # Tauri setup and command routing
    │   └── main.rs           # OS Entry point
    ├── Cargo.toml            # Rust dependencies
    ├── tauri.conf.json       # App configuration
    └── .env                  # Port variables

```

```

```
