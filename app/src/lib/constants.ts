import { platform } from '@tauri-apps/plugin-os';

export const IS_TAURI = '__TAURI_INTERNALS__' in window;
export const TAURI_PLATFORM = IS_TAURI ? platform() : null;
export const IS_MOBILE =
	TAURI_PLATFORM === 'android' || TAURI_PLATFORM === 'ios';
export const ROOM_TOKEN_HASH_PARAM = 'join';
export const ACCOUNT_EXPORT_HASH_PARAM = 'oldAccount';
