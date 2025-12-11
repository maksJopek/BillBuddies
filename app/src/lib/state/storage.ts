import * as crypto from './crypto';

export interface Account {
	id: string;
	name: string;
}

type StringRoomKeys = Record<string, string>;

export type RoomKeys = Record<string, CryptoKey>;

const STORAGE = localStorage;
const ACCOUNT_KEY = 'account';
const ROOM_KEYS_KEY = 'room-keys';

function getStorageItem<T>(key: string) {
	const item = STORAGE.getItem(key);
	if (item) {
		return JSON.parse(item) as T;
	}
	return null;
}

function setStorageItem<T>(key: string, data: T) {
	STORAGE.setItem(key, JSON.stringify(data));
}

export function getAccount() {
	return getStorageItem<Account>(ACCOUNT_KEY);
}

export function setAccount(account: Account) {
	setStorageItem(ACCOUNT_KEY, account);
}

export async function getRoomKeys() {
	const str = getStorageItem<StringRoomKeys>(ROOM_KEYS_KEY);
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
