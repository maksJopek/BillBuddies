import { toast } from 'svelte-sonner';
import { ROOM_TOKEN_HASH_PARAM } from '$lib/constants';
import * as crypto from './crypto';
import * as storage from './storage';
import * as api from './api';
import { connectWS, listenOnRoom } from '../websocket';

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
	rooms: Room[];
	roomKeys: storage.RoomKeys;
	account: storage.Account;
	loading: Promise<void> | null;
	loaded: boolean;
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
	rooms: [],
	roomKeys: {},
	account: storage.getAccount() ?? defaultAccount(),
	loading: null,
	loaded: false
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
	const promises: Promise<Room>[] = Object.entries(appState.roomKeys).map(
		async ([id, key]) => {
			const room = await crypto.decryptRoom(await api.getRoom(id), key);
			listenOnRoom(id);
			return { ...room!, id, balance: calcRoomBalance(room!) };
		}
	);
	appState.rooms = await Promise.all(promises);
	appState.loaded = true;
}

async function checkLocationHash() {
	const check = async () => {
		if (location.hash.startsWith('#' + ROOM_TOKEN_HASH_PARAM + '=')) {
			const params = new URLSearchParams(location.hash.slice(1));
			await importRoom(params.get(ROOM_TOKEN_HASH_PARAM)!);
			params.delete(ROOM_TOKEN_HASH_PARAM);
			if (params.size === 0) {
				location.hash = '';
			} else {
				location.hash = '#' + params.toString();
			}
		}
	};
	await check();
	window.onhashchange = check;
}

export async function loadData() {
	await connectWS();
	if (!appState.loading) {
		appState.loading = loadRooms();
	}
	await appState.loading;
	await checkLocationHash();
}

export function tryFindRoom(id: string) {
	return appState.rooms.find((r) => r.id === id) ?? null;
}

export function findRoom(id: string) {
	return tryFindRoom(id)!;
}

async function addRoom(room: crypto.Room, key: CryptoKey, id?: string) {
	const encrypted = await crypto.encryptRoom(room, key);
	if (id === undefined) {
		id = crypto.getRandomUUID();
		await api.createRoom(id, encrypted);
	} else {
		await api.editRoom(id, encrypted);
	}
	const r: Room = {
		...room,
		id,
		balance: calcRoomBalance(room)
	};
	appState.rooms.push(r);
	appState.roomKeys[r.id] = key;
	storage.setRoomKeys(appState.roomKeys);
	listenOnRoom(id);
	return id;
}

async function saveRoom(id: string, data: Partial<crypto.Room>) {
	const { name, users, expenses } = findRoom(id);
	const combined: crypto.Room = { name, users, expenses };
	Object.assign(combined, data);
	const key = appState.roomKeys[id];
	const encrypted = await crypto.encryptRoom(combined, key);
	await api.editRoom(id, encrypted);
	const room = findRoom(id);
	Object.assign(room, { ...data, balance: calcRoomBalance(combined) });
}

export async function importRoom(token: string) {
	const parsed = await crypto.parseRoomToken(token);
	if (!parsed) {
		toast.error('Link jest nieprawidłowy');
		return;
	}
	const { id, key } = parsed;
	const { iv, data } = await api.getRoom(id);
	const room = await crypto.decryptRoom({ iv, data }, key);
	if (!room) {
		toast.error('Link jest nieprawidłowy');
		return;
	}
	if (tryFindRoom(id) !== null) {
		toast.warning('Pokój już istnieje');
		return;
	}
	room.users[appState.account.id] = appState.account.name;
	await addRoom(room, key, id);
	toast.success('Dołączono do pokoju');
}

export async function createRoom(name: string) {
	const key = await crypto.generateKey();
	const me = appState.account;
	return addRoom({ name, users: { [me.id]: me.name }, expenses: [] }, key);
}

export function shareRoom(id: string) {
	const key = appState.roomKeys[id];
	return crypto.createRoomToken({ id, key });
}

export async function editRoom(id: string, name: string) {
	await saveRoom(id, { name });
}

export async function deleteRoom(id: string, localOnly = false) {
	if (localOnly === false) {
		await api.deleteRoom(id);
	}
	appState.rooms = appState.rooms.filter((r) => r.id !== id);
	delete appState.roomKeys[id];
	storage.setRoomKeys(appState.roomKeys);
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
