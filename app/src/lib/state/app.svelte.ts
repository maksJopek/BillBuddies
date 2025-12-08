import { decrypt, encrypt } from '$lib/crypto.ts';

export type WithoutID<T> = Omit<T, 'id'>;

export type PartialWithoutID<T> = Partial<WithoutID<T>>;

export interface User {
	id: string;
	name: string;
}

export interface Expense {
	id: string;
	amount: number;
	description: string;
	date: string;
	paidBy: string;
}

export interface Room {
	id: string;
	name: string;
	balance: number;
	users: {
		[uuid: string]: /* name */ string;
	};
	expenses: Expense[];
}

export interface AppState {
	rooms: Room[];
	account: User;
	loaded: boolean;
	tauri: boolean;
}

const LOCAL_STORAGE_ACCOUNT_KEY = 'account';
const LOCAL_STORAGE_ROOM_UUIDS_KEY = 'room-uuids';

const localStorageAccount = localStorage.getItem(LOCAL_STORAGE_ACCOUNT_KEY);

export const appState = $state<AppState>({
	rooms: [],
	account: localStorageAccount
		? JSON.parse(localStorageAccount)
		: {
				id: crypto.randomUUID(),
				name: 'Bob'
			},
	loaded: false,
	tauri: '__TAURI_INTERNALS__' in window
});
function saveAppStateToLocalStorage() {
	localStorage.setItem(
		LOCAL_STORAGE_ROOM_UUIDS_KEY,
		JSON.stringify(appState.rooms.map((r) => r.id))
	);
	localStorage.setItem(
		LOCAL_STORAGE_ACCOUNT_KEY,
		JSON.stringify(appState.account)
	);
}

function calcRoomBalance(room: Omit<Room, 'balance'>) {
	let wholeSum = 0,
		mySum = 0;
	const users = new Set<string>();
	for (const expense of room.expenses) {
		users.add(expense.paidBy);
		wholeSum += expense.amount;
		if (expense.paidBy === appState.account.id) {
			mySum += expense.amount;
		}
	}

	return mySum - wholeSum / users.size;
}

async function request(url: string, options?: Partial<RequestInit>) {
	if (options?.body !== undefined) {
		options.headers ??= {};
		//@ts-expect-error - this works as expected
		options.headers['Content-Type'] = 'application/json';
	}
	return await fetch(import.meta.env.VITE_API_URL + url, options).then((res) =>
		res.text()
	);
}
await loadData();
export async function loadData() {
	const roomUUIDs: string[] = JSON.parse(
		localStorage.getItem(LOCAL_STORAGE_ROOM_UUIDS_KEY) ?? '[]'
	);

	const promises = roomUUIDs.map(async (uuid) => {
		const room = decrypt(await request('/room/' + uuid));
		room.id = uuid;
		room.balance = calcRoomBalance(room);
		return room;
	});
	appState.rooms = await Promise.all(promises);
	appState.loaded = true;
}

export function findRoom(id: string) {
	return appState.rooms.find((r) => r.id === id) ?? null;
}

export async function saveRoomToDB(room: Room) {
	let method = 'PATCH';
	if (room.id === undefined) {
		room.id = crypto.randomUUID();
		method = 'POST';
	}
	await request('/room/' + room.id, {
		method,
		body: encrypt(room)
	});
}
export async function addRoom(room: WithoutID<Room>) {
	const r = room as unknown as Room;
	await saveRoomToDB(r);
	appState.rooms.push(r);
	saveAppStateToLocalStorage();
}

export async function editRoom(
	roomId: string,
	roomData: PartialWithoutID<Room>
) {
	const room = findRoom(roomId)!;
	Object.assign(room, roomData);
	await saveRoomToDB(room);
}

export async function deleteRoom(roomId: string) {
	appState.rooms = appState.rooms.filter((r) => r.id !== roomId);
	await request('/room/' + roomId, {
		method: 'DELETE'
	});
	saveAppStateToLocalStorage();
}

export function findExpense(roomId: string, expenseId: string) {
	const r = findRoom(roomId);
	return r ? (r.expenses.find((e) => e.id === expenseId) ?? null) : null;
}

export async function addExpense(roomId: string, expense: WithoutID<Expense>) {
	const room = findRoom(roomId)!;
	room.expenses.push({ ...expense, id: crypto.randomUUID() });
	await saveRoomToDB(room);
}

export async function editExpense(
	roomId: string,
	expenseId: string,
	expense: PartialWithoutID<Expense>
) {
	const r = findRoom(roomId)!;
	const e = r.expenses.find((e) => e.id === expenseId)!;
	Object.assign(e, expense);
	await saveRoomToDB(r);
}

export async function deleteExpense(roomId: string, expenseId: string) {
	const r = findRoom(roomId)!;
	r.expenses = r.expenses.filter((e) => e.id !== expenseId);
	await saveRoomToDB(r);
}

export function findUserName(roomId: string, userId: string) {
	const r = findRoom(roomId);
	return r?.users[userId] ?? null;
}

export async function editAccount(account: PartialWithoutID<User>) {
	Object.assign(appState.account, account);
	localStorage.setItem(
		LOCAL_STORAGE_ACCOUNT_KEY,
		JSON.stringify(appState.account)
	);
	const promises = [];
	for (const room of appState.rooms) {
		room.users[appState.account.id] = account.name!;
		promises.push(saveRoomToDB(room));
	}
	await Promise.all(promises);
}
