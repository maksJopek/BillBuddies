export const IS_TAURI = '__TAURI_INTERNALS__' in window;
export const IS_ANDROID = /Android/i.test(navigator.userAgent);
export const IS_ANDROID_BROWSER = !IS_TAURI && IS_ANDROID;
export const ROOM_TOKEN_HASH_PARAM = 'join';
export const ACCOUNT_EXPORT_HASH_PARAM = 'oldAccount';
