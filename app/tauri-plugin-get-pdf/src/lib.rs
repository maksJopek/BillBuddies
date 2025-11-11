use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::GetPdf;
#[cfg(mobile)]
use mobile::GetPdf;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the get-pdf APIs.
pub trait GetPdfExt<R: Runtime> {
  fn get_pdf(&self) -> &GetPdf<R>;
}

impl<R: Runtime, T: Manager<R>> crate::GetPdfExt<R> for T {
  fn get_pdf(&self) -> &GetPdf<R> {
    self.state::<GetPdf<R>>().inner()
  }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("get-pdf")
    .invoke_handler(tauri::generate_handler![commands::check_pending_intent])
    .setup(|app, api| {
      #[cfg(mobile)]
      let get_pdf = mobile::init(app, api)?;
      #[cfg(desktop)]
      let get_pdf = desktop::init(app, api)?;
      app.manage(get_pdf);
      Ok(())
    })
    .build()
}
