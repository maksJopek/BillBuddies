use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<GetPdf<R>> {
  Ok(GetPdf(app.clone()))
}

/// Access to the get-pdf APIs.
pub struct GetPdf<R: Runtime>(AppHandle<R>);

impl<R: Runtime> GetPdf<R> {
  pub fn check_pending_intent(&self) -> crate::Result<Option<CheckPendingIntentResponse>> {
    Ok(None)
  }
}
