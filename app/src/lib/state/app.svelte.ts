import { goto, invalidateAll } from '$app/navigation';
import { toast } from 'svelte-sonner';
import { ROOM_TOKEN_HASH_PARAM } from '$lib/constants';
import * as crypto from './crypto';
import * as storage from './storage';
import * as api from './api';
import * as ws from './websocket';

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

export interface AppState {
	missingRooms: number | null;
	rooms: Room[];
	roomKeys: storage.RoomKeys;
	account: storage.Account;
	loading: Promise<void> | null;
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
	missingRooms: null,
	rooms: [],
	roomKeys: {},
	account: storage.getAccount() ?? defaultAccount(),
	loading: null
});

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

async function loadKeys() {
	const keys = await storage.getRoomKeys();
	if (keys) {
		appState.roomKeys = keys;
	}
}

async function loadRooms() {
	await loadKeys();
	const keys = Object.entries(appState.roomKeys);
	const ids = Object.keys(appState.roomKeys);
	const promises: Promise<Room | null>[] = keys.map(async ([id, key]) => {
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
	let missingCount = 0;
	rooms.forEach((r, i) => {
		if (r === null) {
			missingCount++;
			delete appState.roomKeys[ids[i]];
		}
	});
	if (missingCount !== 0) {
		storage.setRoomKeys(appState.roomKeys);
	}
	appState.missingRooms = missingCount;
	appState.rooms = rooms.filter((r) => r !== null);
}

async function loadData() {
	if (!appState.loading) {
		appState.loading = loadRooms();
	}
	await appState.loading;
}

function resetData() {
	appState.missingRooms = null;
	appState.roomKeys = {};
	appState.rooms = [];
	appState.loading = null;
}

export async function appLoad() {
	await ws.connect();
	await loadData();
}

export function appUnload() {
	resetData();
	ws.disconnect();
}

export async function appLoadRetry() {
	appUnload();
	await invalidateAll();
}

export async function checkRoomToken() {
	if (!location.hash.startsWith('#' + ROOM_TOKEN_HASH_PARAM + '=')) {
		return;
	}
	const params = new URLSearchParams(location.hash.slice(1));
	const token = params.get(ROOM_TOKEN_HASH_PARAM)!;
	const id = await importRoom(token);
	if (id) {
		await goto(`/room/${id}`, { replaceState: true });
	} else {
		await goto(`/`, { replaceState: true });
	}
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

export async function importRoom(token: string) {
	await loadRooms();
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

export async function createRoom(name: string) {
	const key = await crypto.generateKey();
	const me = appState.account;
	return addRoom({ name, users: { [me.id]: me.name }, expenses: [] }, key);
}

export async function shareRoom(id: string) {
	const key = appState.roomKeys[id];
	const token = await crypto.createRoomToken({ id, key });
	const url = `${location.origin}#${ROOM_TOKEN_HASH_PARAM}=${token}`;
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
