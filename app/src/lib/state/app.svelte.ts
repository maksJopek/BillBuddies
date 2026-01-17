import { getCurrent as getStartUrls } from '@tauri-apps/plugin-deep-link';
import { toast } from 'svelte-sonner';
import { page } from '$app/state';
import { goto, invalidateAll } from '$app/navigation';
import {
	ACCOUNT_EXPORT_HASH_PARAM,
	IS_ANDROID_BROWSER,
	IS_TAURI,
	ROOM_TOKEN_HASH_PARAM
} from '$lib/constants';
import * as crypto from './crypto';
import * as storage from './storage';
import * as api from './api';
import * as ws from './websocket';

export { exportData } from './storage';

export type WithoutID<T> = Omit<T, 'id'>;

export type PartialWithoutID<T> = Partial<WithoutID<T>>;

export interface Expense {
	id: string;
	amount: number;
	description: string;
	date: string;
	paidBy: string;
}

export interface Room extends crypto.Room {
	id: string;
	balance: number;
}

export interface ToastMessage {
	type: 'success' | 'info' | 'warning' | 'error';
	message: string;
	duration?: number;
}

export interface AppState {
	once: boolean;
	appDownloadPopup: boolean;
	rooms: Room[];
	roomKeys: storage.RoomKeys;
	account: storage.Account;
	loading: Promise<void> | null;
	loadingToasts: ToastMessage[];
	loadingRedirect: string | null;
	loadingRoomToken: string | null;
}

function defaultAccount() {
	const n = 10_000 + Math.round(Math.random() * (99_999 - 10_000));
	const account: storage.Account = {
		id: crypto.getRandomUUID(),
		name: `User ${n}`
	};
	storage.setAccount(account);
	return account;
}

export const appState = $state<AppState>({
	once: false,
	appDownloadPopup: storage.getAppDownloadPopup() ?? IS_ANDROID_BROWSER,
	rooms: [],
	roomKeys: {},
	account: storage.getAccount() ?? defaultAccount(),
	loading: null,
	loadingToasts: [],
	loadingRedirect: null,
	loadingRoomToken: null
});

export function disableAppDownloadPopup() {
	appState.appDownloadPopup = false;
	storage.setAppDownloadPopup(false);
}

export function calcRoomBalance(room: crypto.Room) {
	if (room.expenses.length === 0) {
		return 0;
	}
	let wholeSum = 0,
		mySum = 0;
	const users = Object.keys(room.users);
	for (const expense of room.expenses) {
		wholeSum += expense.amount;
		if (expense.paidBy === appState.account.id) {
			mySum += expense.amount;
		}
	}
	return mySum - wholeSum / users.length;
}

export function parseDeepLinkHash(urls: string[]) {
	try {
		const url = new URL(urls[0]);
		return url.hash;
	} catch (error) {
		console.error('deep link error:', error);
		return null;
	}
}

async function getStartHash() {
	if (!IS_TAURI) {
		if (location.hash) {
			return location.hash;
		} else {
			return null;
		}
	}
	const urls = await getStartUrls();
	if (!urls) {
		return null;
	}
	const hash = parseDeepLinkHash(urls);
	if (!hash) {
		appState.loadingToasts.push({
			type: 'error',
			message: 'Link jest nieprawidłowy'
		});
		appState.loadingRedirect = '/';
		return null;
	}
	return hash;
}

function getHashParam(hash: string, name: string) {
	if (!hash.startsWith(`#${name}=`)) {
		return null;
	}
	const params = new URLSearchParams(hash.slice(1));
	return params.get(name)!;
}

function getHashRoomToken(hash: string) {
	return getHashParam(hash, ROOM_TOKEN_HASH_PARAM);
}

function getHashAccountExport(hash: string) {
	return getHashParam(hash, ACCOUNT_EXPORT_HASH_PARAM);
}

async function loadStartHash() {
	const hash = await getStartHash();
	if (!hash) {
		return;
	}
	const roomToken = getHashRoomToken(hash);
	if (roomToken) {
		appState.loadingRoomToken = roomToken;
		return;
	}
	const accountExport = getHashAccountExport(hash);
	if (accountExport) {
		if (storage.importData(accountExport)) {
			appState.loadingToasts.push({
				type: 'success',
				message: 'Pomyślnie zaimportowano konto'
			});
		} else {
			appState.loadingToasts.push({
				type: 'error',
				message: 'Import konta nie powiódł się'
			});
		}
		appState.loadingRedirect = '/';
		return;
	}
	appState.loadingToasts.push({
		type: 'error',
		message: 'Link jest nieprawidłowy'
	});
	appState.loadingRedirect = '/';
}

async function loadRooms() {
	const keys = await storage.getRoomKeys();
	if (keys) {
		appState.roomKeys = keys;
	}
	const entries = Object.entries(appState.roomKeys);
	const ids = Object.keys(appState.roomKeys);
	const promises: Promise<Room | null>[] = entries.map(async ([id, key]) => {
		const apiRoom = await api.unsafeGetRoom(id);
		if (!apiRoom) {
			return null;
		}
		const room = await crypto.decryptRoom(apiRoom, key);
		if (!room) {
			throw new Error("can't decrypt room");
		}
		ws.listenOnRoom(id);
		return { ...room, id, balance: calcRoomBalance(room) };
	});
	const rooms = await Promise.all(promises);
	let missingRooms = 0;
	rooms.forEach((r, i) => {
		if (r === null) {
			missingRooms++;
			delete appState.roomKeys[ids[i]];
		}
	});
	if (missingRooms !== 0) {
		storage.setRoomKeys(appState.roomKeys);
		let message = `${missingRooms} pokoi zostało usuniętych przez innego użytkownika`;
		if (missingRooms === 1) {
			message = '1 pokój został usunięty przez innego użytkownika';
		} else if (missingRooms <= 4) {
			message = `${missingRooms} pokoje zostały usunięte przez innego użytkownika`;
		}
		appState.loadingToasts.push({ type: 'warning', message, duration: 8000 });
	}
	appState.rooms = rooms.filter((r) => r !== null);
}

async function loadData() {
	if (!appState.loading) {
		appState.loading = loadRooms();
	}
	await appState.loading;
}

export async function appLoad() {
	await ws.connect();
	if (!appState.once) {
		await loadStartHash();
	}
	await loadData();
}

export function appUnload() {
	appState.rooms = [];
	appState.roomKeys = {};
	appState.loading = null;
	ws.disconnect();
}

export async function appReload() {
	appUnload();
	await invalidateAll();
}

export function tryFindRoom(id: string) {
	return appState.rooms.find((r) => r.id === id) ?? null;
}

export function findRoom(id: string) {
	return tryFindRoom(id)!;
}

async function addRoom(room: crypto.Room, key: CryptoKey, id?: string) {
	const encrypted = await crypto.encryptRoom(room, key);
	const call = id ? api.editRoom : api.createRoom;
	if (!id) {
		id = crypto.getRandomUUID();
	}
	const err = await call(id, encrypted);
	if (err) {
		if (err === api.Err.NOT_FOUND) {
			await deleteRoom(id, true);
		}
		return null;
	}
	const r: Room = {
		...room,
		id,
		balance: calcRoomBalance(room)
	};
	appState.rooms.push(r);
	appState.roomKeys[r.id] = key;
	storage.setRoomKeys(appState.roomKeys);
	ws.listenOnRoom(id);
	return id;
}

async function saveRoom(id: string, data: Partial<crypto.Room>) {
	const { name, users, expenses } = findRoom(id);
	const combined: crypto.Room = { name, users, expenses };
	Object.assign(combined, data);
	const key = appState.roomKeys[id];
	const encrypted = await crypto.encryptRoom(combined, key);
	const err = await api.editRoom(id, encrypted);
	if (err) {
		if (err === api.Err.NOT_FOUND) {
			await goto('/');
			await deleteRoom(id, true);
		}
		return;
	}
	const room = findRoom(id);
	Object.assign(room, { ...data, balance: calcRoomBalance(combined) });
}

async function importRoom(token: string) {
	const parsedToken = await crypto.parseRoomToken(token);
	if (!parsedToken) {
		toast.error('Link jest nieprawidłowy');
		return null;
	}
	const { id, key } = parsedToken;
	const [apiRoom, err] = await api.getRoom(id);
	if (err) {
		return null;
	}
	const { iv, data } = apiRoom;
	const room = await crypto.decryptRoom({ iv, data }, key);
	if (!room) {
		toast.error('Link jest nieprawidłowy');
		return null;
	}
	if (tryFindRoom(id) !== null) {
		toast.warning('Pokój już istnieje');
		return id;
	}
	room.users[appState.account.id] = appState.account.name;
	if (!(await addRoom(room, key, id))) {
		return null;
	}
	toast.success('Dołączono do pokoju');
	return id;
}

export async function importRoomRedirect(token: string) {
	const id = await importRoom(token);
	if (id) {
		await goto(`/room/${id}`, { replaceState: true });
	} else {
		await goto(`/`, { replaceState: true });
	}
}

export async function checkLocationHash(hash?: string) {
	if (!hash) {
		if (location.hash) {
			hash = location.hash;
		} else {
			return;
		}
	}
	const roomToken = getHashRoomToken(hash);
	if (roomToken) {
		await importRoomRedirect(roomToken);
		return;
	}
	const accountExport = getHashAccountExport(hash);
	if (accountExport) {
		const ok = storage.importData(accountExport);
		if (ok) {
			appState.loadingToasts.push({
				type: 'success',
				message: 'Pomyślnie zaimportowano konto'
			});
			await goto(`/`, { replaceState: true });
			await appReload();
		} else {
			toast.error('Import konta nie powiódł się');
		}
		return;
	}
	toast.error('Link jest nieprawidłowy');
}

export async function createRoom(name: string) {
	const key = await crypto.generateKey();
	const me = appState.account;
	return addRoom({ name, users: { [me.id]: me.name }, expenses: [] }, key);
}

export async function shareRoom(id: string) {
	const key = appState.roomKeys[id];
	const token = await crypto.createRoomToken({ id, key });
	const url = `${import.meta.env.VITE_WEB_URL}#${ROOM_TOKEN_HASH_PARAM}=${token}`;
	await navigator.clipboard.writeText(url);
	toast.info('Link skopiowany do schowka');
}

export async function editRoom(id: string, name: string) {
	await saveRoom(id, { name });
}

export async function deleteRoom(id: string, localOnly = false) {
	if (!localOnly) {
		const err = await api.deleteRoom(id);
		if (err === api.Err.UNEXPECTED) {
			return;
		}
	}
	if (page.url.pathname === `/room/${id}`) {
		await goto('/');
	}
	appState.rooms = appState.rooms.filter((r) => r.id !== id);
	delete appState.roomKeys[id];
	await storage.setRoomKeys(appState.roomKeys);
}

export function findExpense(roomId: string, id: string) {
	const r = findRoom(roomId);
	return r.expenses.find((e) => e.id === id)!;
}

export async function addExpense(roomId: string, expense: WithoutID<Expense>) {
	const r = findRoom(roomId);
	const id = crypto.getRandomUUID();
	const e = [...r.expenses, { ...expense, id }];
	await saveRoom(roomId, { expenses: e });
	return id;
}

export async function editExpense(
	roomId: string,
	id: string,
	expense: PartialWithoutID<Expense>
) {
	const r = findRoom(roomId);
	const e = [
		...r.expenses.map((e) => (e.id === id ? { ...e, ...expense } : e))
	];
	await saveRoom(roomId, { expenses: e });
}

export async function deleteExpense(roomId: string, id: string) {
	const r = findRoom(roomId);
	const e = [...r.expenses.filter((e) => e.id !== id)];
	await saveRoom(roomId, { expenses: e });
}

export function findUserName(roomId: string, userId: string) {
	const r = findRoom(roomId);
	return r.users[userId];
}

export async function editAccount(name: string) {
	const id = appState.account.id;
	appState.account.name = name;
	storage.setAccount(appState.account);
	const promises = [];
	for (const room of appState.rooms) {
		promises.push(saveRoom(room.id, { users: { ...room.users, [id]: name } }));
		room.users[id] = name;
	}
	await Promise.all(promises);
}
