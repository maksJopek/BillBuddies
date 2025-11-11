use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckPendingIntentResponse {
  pub action: String,
  pub uri: Option<String>,
  pub text: Option<String>,
  pub mime_type: Option<String>,
}
