// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod adb;      // Links src-tauri/src/adb.rs
mod parser;   // Links src-tauri/src/parser.rs


fn main() {
  app_lib::run();
}
