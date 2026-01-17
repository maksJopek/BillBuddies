import { Base64 } from 'js-base64';
import * as crypto from './crypto';
import { appState } from './app.svelte';

export interface Account {
	id: string;
	name: string;
}

type StringRoomKeys = Record<string, string>;

export type RoomKeys = Record<string, CryptoKey>;

const STORAGE = localStorage;
const ACCOUNT_KEY = 'account';
const ROOM_KEYS_KEY = 'room-keys';
const APP_DOWNLOAD_POPUP_KEY = 'app-download-popup';

function getStorageItem<T>(key: string) {
	const item = STORAGE.getItem(key);
	if (item) {
		return JSON.parse(item) as T;
	}
	return null;
}

function setStorageItem<T>(key: string, data: T) {
	STORAGE.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
}

export function getAccount() {
	return getStorageItem<Account>(ACCOUNT_KEY);
}

export function setAccount(account: Account) {
	setStorageItem(ACCOUNT_KEY, account);
}

function getStringRoomKeys() {
	return getStorageItem<StringRoomKeys>(ROOM_KEYS_KEY);
}

export async function getRoomKeys() {
	const str = getStringRoomKeys();
	if (!str) {
		return null;
	}
	const keys: RoomKeys = {};
	for (const id in str) {
		keys[id] = await crypto.parseKey(str[id]);
	}
	return keys;
}

export async function setRoomKeys(keys: Record<string, CryptoKey>) {
	const str: StringRoomKeys = {};
	for (const id in keys) {
		str[id] = await crypto.stringifyKey(keys[id]);
	}
	setStorageItem(ROOM_KEYS_KEY, str);
}

interface Export {
	[ACCOUNT_KEY]: Account;
	[ROOM_KEYS_KEY]: StringRoomKeys;
}

export function exportData() {
	const data: Export = {
		[ACCOUNT_KEY]: getAccount()!,
		[ROOM_KEYS_KEY]: getStringRoomKeys() ?? {}
	};
	return Base64.encodeURL(JSON.stringify(data));
}

export function importData(data: string) {
	try {
		const storage: Export = JSON.parse(Base64.decode(data));
		for (const [key, val] of Object.entries(storage)) {
			setStorageItem(key, val);
		}
		appState.account = storage[ACCOUNT_KEY];
		return true;
	} catch (error) {
		console.error('account import error:', error);
		return false;
	}
}

export function getAppDownloadPopup() {
	return getStorageItem<boolean>(APP_DOWNLOAD_POPUP_KEY);
}

export function setAppDownloadPopup(popup: boolean) {
	setStorageItem(APP_DOWNLOAD_POPUP_KEY, popup);
}
