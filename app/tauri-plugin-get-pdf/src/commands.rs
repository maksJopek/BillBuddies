use tauri::{AppHandle, command, Runtime};

use crate::models::*;
use crate::Result;
use crate::GetPdfExt;

#[command]
pub(crate) async fn check_pending_intent<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Option<CheckPendingIntentResponse>> {
    app.get_pdf().check_pending_intent()
}
