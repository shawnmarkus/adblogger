mod adb;
mod parser;

use tauri::{AppHandle, Emitter, Manager, Runtime};
use tokio::io::{AsyncBufReadExt, BufReader};
use std::sync::Arc;
use tokio::sync::Mutex;
use dotenvy::dotenv;
use std::env;

struct NetSpyState {
    packet_seq: Arc<Mutex<i32>>,
    port: u16,
}

#[tauri::command]
async fn get_app_config(state: tauri::State<'_, NetSpyState>) -> Result<u16, String> {
    Ok(state.port)
}

#[tauri::command]
async fn get_devices() -> Result<Vec<adb::Device>, String> {
    Ok(adb::get_adb_devices().await)
}

#[tauri::command]
async fn start_capture<R: Runtime>(
    app: AppHandle<R>, 
    device_id: String, 
    state: tauri::State<'_, NetSpyState>
) -> Result<(), String> {
    let packet_seq = state.packet_seq.clone();
    
    tokio::spawn(async move {
        let mut child = adb::spawn_logcat(&device_id);
        let stdout = child.stdout.take().unwrap();
        let mut reader = BufReader::new(stdout).lines();

        while let Ok(Some(line)) = reader.next_line().await {
            let _ = app.emit("raw-log", &line);
            if let Some(pkt) = parser::parse_line(&line, 0) {
                let mut seq = packet_seq.lock().await;
                *seq += 1;
                let mut final_pkt = pkt;
                final_pkt.no = *seq;
                let _ = app.emit("packet-received", final_pkt);
            }
        }
    });
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();
    let dynamic_port = env::var("NETSPY_PORT")
        .unwrap_or_else(|_| "7474".to_string())
        .parse::<u16>()
        .unwrap_or(7474);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(NetSpyState { packet_seq: Arc::new(Mutex::new(0)), port: dynamic_port })
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            // Start the ADB Device Watcher Daemon exactly once
            adb::start_device_watcher(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_devices, start_capture, get_app_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}