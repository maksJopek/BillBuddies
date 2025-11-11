import { invoke } from '@tauri-apps/api/core';

export interface Intent {
	action: string;
	uri?: string;
	text?: string;
	mimeType?: string;
}

export async function checkPendingIntent(): Promise<Intent | null> {
	return await invoke('plugin:get-pdf|check_pending_intent');
}
