use tokio::process::Command;
use std::process::Stdio;
use serde::Serialize;
use tauri::{AppHandle, Emitter};

#[derive(Serialize, Debug, Clone, PartialEq)]
pub struct Device {
    pub id: String,
    pub model: String,
}



pub fn spawn_logcat(device_id: &str) -> tokio::process::Child {
    Command::new("adb")
        .args(["-s", device_id, "logcat", "-v", "threadtime"])
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to start ADB logcat")
}

pub fn start_device_watcher(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut last_devices: Vec<Device> = Vec::new();
        loop {
            let current_devices = get_adb_devices().await;
            if current_devices != last_devices {
                last_devices = current_devices.clone();
                let _ = app.emit("devices-updated", &last_devices);
            }
            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
        }
    });
}

pub async fn get_adb_devices() -> Vec<Device> {
    // Safely execute ADB. If it fails (e.g., missing from PATH), it catches the error.
    let output = match Command::new("adb").arg("devices").output().await {
        Ok(o) => o,
        Err(e) => {
            println!("⚠️ ADB ERROR: Could not execute 'adb'. Is it in your system PATH? Error: {}", e);
            return Vec::new(); // Return empty list instead of crashing the app
        }
    };

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();

    for line in stdout.lines().skip(1) {
        if line.contains("\tdevice") {
            let id = line.split('\t').next().unwrap_or("").to_string();
            let model_out = Command::new("adb").args(["-s", &id, "shell", "getprop", "ro.product.model"]).output().await.ok();
            let model = model_out.map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string()).unwrap_or(id.clone());
            devices.push(Device { id, model });
        }
    }
    devices
}