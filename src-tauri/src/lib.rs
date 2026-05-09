mod stream;

use tauri_plugin_log::{Target, TargetKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([Target::new(TargetKind::LogDir { file_name: None })])
                .max_file_size(1024*1024*5)
                .build(),
        )
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![stream::stream_fetch])
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            #[cfg(desktop)]
            let _ = _app
                .handle()
                .plugin(tauri_plugin_window_state::Builder::default().build());
            Ok(())
        })
        .setup(|_app| {
            #[cfg(desktop)]
            let _ = _app
                .handle()
                .plugin(tauri_plugin_updater::Builder::new().build());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
