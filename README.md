# Local SMS 2FA Gateway 📲🔓

An ultra-reliable, 100% free, and completely offline SMS 2FA gateway that turns your physical Android device (e.g., Samsung S23+ or Google Pixel 9 Pro XL) connected to your computer into a programmatic SMS dispatcher. 

By wrapping the Android Debug Bridge (ADB) with a lightweight Express server, you can trigger SMS dispatches via standard HTTP POST requests.

---

## 🌟 Features

*   **Completely Offline & Free:** No Twilio, AWS SNS, or expensive carrier gateway plans required. Uses your physical phone's existing cellular network connection.
*   **Fully Automated Lifecycle:**
    *   Detects if the phone screen is active (`mScreenOn`).
    *   Wakes up the screen if asleep.
    *   Performs structural swipe gestures tailored to device layout (One UI / Stock Pixel OS).
    *   Inputs PIN dynamically and unlocks the phone.
    *   Spins up the default Android SMS client with pre-populated phone and text parameters.
    *   Simulates physical screen taps to trigger the visual "Send" button.
    *   Cleanly returns to the Home Screen and locks the device back down safely.
*   **Production-Ready Background Run:** Runs quietly in the background as a daemon utilizing **PM2**.
*   **Universal Testing Client:** Lightweight Mac/Linux compatible Bash script (`send.sh`) that dynamically generates 6-digit random codes (`jot`/`shuf`) for rapid testing.

---

## 🛠️ Architecture

```
[ Your Web App / Server ]
         │ (HTTP POST /send-2fa)
         ▼
[ Local Node.js Express Server ]
         │ (adb shell commands)
         ▼
[ Physical Android Device ] (via USB / Wi-Fi ADB)
         │ (Cellular Carrier Network)
         ▼
[ Recipient Device ]
```

---

## 📋 Prerequisites

1.  **Node.js & npm** (v16+) installed.
2.  **ADB (Android Debug Bridge)** installed on your host system:
    *   *macOS*: `brew install android-platform-tools`
    *   *Ubuntu/Linux*: `sudo apt install android-tools-adb`
3.  **Developer Options** enabled on your Android device:
    *   Go to **Settings > About phone > Software information** and tap **Build number** 7 times.
    *   Go to **Developer options** and turn on **USB Debugging**.
    *   *(Optional)* If using wireless ADB, configure **Wireless Debugging**.

---

## 📥 Installation

1.  Clone this repository:
    ```bash
    git clone https://github.com/YOUR_USERNAME/local-sms-2fa-gateway.git
    cd local-sms-2fa-gateway
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

---

## 🚀 Setup & Configuration

### 1. Identify Your Device Dimensions & Settings
Open `sms-server.js` and configure your phone parameters:

*   **Pin Lock Code**: Replace `MY_PHONE_PIN` with your device's actual lock screen PIN.
*   **Send Button Coordinates**: The script simulates a click on the "Send" button inside your default SMS app. Standard layouts:
    *   *Samsung S23+*: `960 2222`
    *   *Google Pixel 9 Pro XL*: Run `adb shell input tap X Y` testing to target your layout.
*   **Unlock Gestures**:
    *   *Samsung One UI (S23+)*:
        ```javascript
        await execPromise("adb shell input swipe 500 1800 500 500 200");
        ```
    *   *Google Pixel 9 Pro XL*:
        ```javascript
        await execPromise("adb shell input swipe 670 2300 670 800 250");
        ```

### 2. Run in Production Background (PM2)
To keep the server running persistently in the background:

```bash
# Install PM2 globally
npm install -g pm2

# Start the gateway
pm2 start sms-server.js --name "sms-gateway"

# Ensure it survives OS reboots
pm2 startup
pm2 save
```

### 📊 PM2 Cheat Sheet:
*   View runtime logs: `pm2 logs sms-gateway`
*   View status: `pm2 list`
*   Restart server: `pm2 restart sms-gateway`
*   Stop server: `pm2 stop sms-gateway`

---

## 📡 API Usage

### Endpoint: `POST /send-2fa`

#### Request Payload:
```json
{
  "phone": "+573014743785",
  "code": "847293"
}
```

#### Example `curl` Call:
```bash
curl -X POST http://localhost:8000/send-2fa \
     -H "Content-Type: application/json" \
     -d '{"phone": "+573014743785", "code": "847293"}'
```

#### Successful Response:
```json
{ "status": "success" }
```

---

## 🐚 Testing Command-Line Client (`send.sh`)

We include a cross-platform Bash script (`send.sh`) to query the gateway directly from your terminal. It supports **macOS** (`jot`) and **Linux** (`shuf`) out of the box for generating random 2FA codes on-the-fly.

### Setup:
Make the script executable:
```bash
chmod +x send.sh
```

### Usage:
1.  **Test automatically** (sends a random 6-digit code to the default phone configured in the script):
    ```bash
    ./send.sh
    ```
2.  **Test with custom details**:
    ```bash
    ./send.sh +573014743785 1234
    ```

---

## 🔒 Security Recommendations

*   **Local Network Only**: By default, the Express app listens locally on `127.0.0.1` (or `localhost`). Do not expose port `8000` or `5000` directly to the public internet.
*   **API Key Authorization**: If exposing the gateway to other servers on your LAN, implement a basic authorization header verification middleware.
*   **Never Sleep (Alternative)**: To avoid writing your PIN inside plain text scripts on your machine, go to **Developer Options** and turn on **Stay Awake**. Keeping the physical phone charging over USB on your desk ensures the screen never turns off, allowing the script to instantly process standard ADB intents and physical coordinate clicks without the unlock sequences.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
