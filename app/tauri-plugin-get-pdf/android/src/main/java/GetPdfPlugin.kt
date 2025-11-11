package eu.jopek.get_pdf

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import app.tauri.plugin.Invoke

@TauriPlugin
class GetPdfPlugin(private val activity: Activity) : Plugin(activity) {
    companion object {
        val TAG = "BillBuddies"
    }

    private var pendingPayload: JSObject? = null

    init {
        if (activity.intent.action == Intent.ACTION_SEND) {
            pendingPayload = createPayload(activity.intent)
        }
    }


    @Command
    fun checkPendingIntent(invoke: Invoke) {
        if (pendingPayload == null) {
            invoke.resolve()
            return
        }

        invoke.resolve(pendingPayload)
        pendingPayload = null
    }

    override fun onNewIntent(intent: Intent) {
        if (intent.action == Intent.ACTION_SEND) {
            pendingPayload = createPayload(intent)
        }
    }

    @SuppressLint("NewApi")
    private fun createPayload(intent: Intent): JSObject {
        val payload = JSObject()
        payload.put("action", intent.action)

        intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)?.let { uri ->
            payload.put("uri", uri.toString())
        }

        intent.getStringExtra(Intent.EXTRA_TEXT)?.let { text ->
            payload.put("text", text)
        }

        intent.type?.let { type ->
            payload.put("mimeType", type)
        }

        return payload
    }
}
