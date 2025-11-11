const COMMANDS: &[&str] = &["check_pending_intent", "registerListener"];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
