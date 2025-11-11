use serde::de::DeserializeOwned;
use tauri::{
  plugin::{PluginApi, PluginHandle},
  AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_get_pdf);

// initializes the Kotlin or Swift plugin classes
pub fn init<R: Runtime, C: DeserializeOwned>(
  _app: &AppHandle<R>,
  api: PluginApi<R, C>,
) -> crate::Result<GetPdf<R>> {
  #[cfg(target_os = "android")]
  let handle = api.register_android_plugin("eu.jopek.get_pdf", "GetPdfPlugin")?;
  #[cfg(target_os = "ios")]
  let handle = api.register_ios_plugin(init_plugin_get_pdf)?;
  Ok(GetPdf(handle))
}

/// Access to the get-pdf APIs.
pub struct GetPdf<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> GetPdf<R> {
  pub fn check_pending_intent(&self) -> crate::Result<Option<CheckPendingIntentResponse>> {
    self
      .0
      .run_mobile_plugin("checkPendingIntent", {})
      .map_err(Into::into)
  }
}
