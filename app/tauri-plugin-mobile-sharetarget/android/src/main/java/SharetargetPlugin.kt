package com.plugin.mobilesharetarget

import android.app.Activity
import android.net.Uri
import android.content.Intent
import android.webkit.WebView
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Plugin

@TauriPlugin
class SharetargetPlugin(private val activity: Activity): Plugin(activity) {
    private val implementation = Sharetarget()

    /// Handle intents when app is being launched
    override fun load(webView: WebView) {
        val intent = activity.intent

        if (intent.action == Intent.ACTION_SEND) {
            val uri: Uri? =
                intent.clipData
                    ?.takeIf { it.itemCount > 0 }
                    ?.getItemAt(0)
                    ?.uri
                    ?: intent.getParcelableExtra(Intent.EXTRA_STREAM)

            uri?.let {
                implementation.pushIntent(it.toString())
            }
        }
    }

    /// Handle intents when app is already launched
    override fun onNewIntent(intent: Intent) {
        if (intent.action == Intent.ACTION_SEND) {
            val uri: Uri? =
                intent.clipData
                    ?.takeIf { it.itemCount > 0 }
                    ?.getItemAt(0)
                    ?.uri
                    ?: intent.getParcelableExtra(Intent.EXTRA_STREAM)
            
            uri?.let {
                implementation.pushIntent(it.toString())
            }
        }
    }
}
