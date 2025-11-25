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
	users: User[];
	expenses: Expense[];
}

export interface AppState {
	rooms: Room[];
	account: User;
	loaded: boolean;
}

const LOCAL_STORAGE_ACCOUNT_KEY = 'account';

const localStorageAccount = localStorage.getItem(LOCAL_STORAGE_ACCOUNT_KEY);

export const appState = $state<AppState>({
	rooms: [],
	account: localStorageAccount
		? JSON.parse(localStorageAccount)
		: {
				id: crypto.randomUUID(),
				name: 'Bob'
			},
	loaded: false
});

function calcBalance(room: Omit<Room, 'balance'>) {
	const neg = Math.random() > 0.5 ? -1 : 1;
	return Math.random() * 5 * room.expenses[0].amount * neg;
}

export const room1Id = crypto.randomUUID();
export const room2Id = crypto.randomUUID();
export const user1Id = crypto.randomUUID();
export const user2Id = crypto.randomUUID();
export const user3Id = crypto.randomUUID();

export async function loadData() {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const fetched: Omit<Room, 'balance'>[] = [
		{
			id: room1Id,
			name: 'Apartment',
			users: [
				{
					id: user1Id,
					name: 'John'
				},
				{
					id: user2Id,
					name: 'Sarah'
				},
				{
					id: user3Id,
					name: 'Mike'
				},
				{ ...appState.account }
			],
			expenses: [
				{
					id: crypto.randomUUID(),
					amount: 45.5,
					description: 'Groceries',
					date: '2025-11-20T19:30',
					paidBy: user1Id
				},
				{
					id: crypto.randomUUID(),
					amount: 89.0,
					description: 'Electricity',
					date: '2025-11-20T19:42',
					paidBy: appState.account.id
				},
				{
					id: crypto.randomUUID(),
					amount: 50.0,
					description: 'Internet',
					date: '2025-11-21T11:04',
					paidBy: user2Id
				}
			]
		},
		{
			id: room2Id,
			name: 'Vacation',
			users: [
				{
					id: user1Id,
					name: 'John'
				},
				{
					id: user2Id,
					name: 'Sarah'
				},
				{
					id: user3Id,
					name: 'Mike'
				},
				{ ...appState.account }
			],
			expenses: [
				{
					id: crypto.randomUUID(),
					amount: 250.0,
					description: 'Hotel',
					date: '2025-11-24T15:27',
					paidBy: user3Id
				},
				{
					id: crypto.randomUUID(),
					amount: 60.0,
					description: 'Gas',
					date: '2025-11-24T06:33',
					paidBy: appState.account.id
				}
			]
		}
	];

	appState.rooms = fetched.map((r) => ({ ...r, balance: calcBalance(r) }));
	appState.loaded = true;
}

export function findRoom(id: string) {
	return appState.rooms.find((r) => r.id === id) ?? null;
}

export function addRoom(room: WithoutID<Room>) {
	appState.rooms.push({ ...room, id: crypto.randomUUID() });
}

export function editRoom(roomId: string, room: PartialWithoutID<Room>) {
	Object.assign(findRoom(roomId)!, room);
}

export function deleteRoom(roomId: string) {
	appState.rooms = appState.rooms.filter((r) => r.id !== roomId);
}

export function findExpense(roomId: string, expenseId: string) {
	const r = findRoom(roomId);
	return r ? (r.expenses.find((e) => e.id === expenseId) ?? null) : null;
}

export function addExpense(roomId: string, expense: WithoutID<Expense>) {
	findRoom(roomId)!.expenses.push({ ...expense, id: crypto.randomUUID() });
}

export function editExpense(
	roomId: string,
	expenseId: string,
	expense: PartialWithoutID<Expense>
) {
	const r = findRoom(roomId)!;
	const e = r.expenses.find((e) => e.id === expenseId)!;
	Object.assign(e, expense);
}

export function deleteExpense(roomId: string, expenseId: string) {
	const r = findRoom(roomId)!;
	r.expenses = r.expenses.filter((e) => e.id !== expenseId);
}

export function findUser(roomId: string, userId: string) {
	const r = findRoom(roomId);
	return r ? (r.users.find((u) => u.id === userId) ?? null) : null;
}

export function editUser(
	roomId: string,
	userId: string,
	user: PartialWithoutID<User>
) {
	Object.assign(findUser(roomId, userId)!, user);
}

export function tryEditUser(
	roomId: string,
	userId: string,
	user: PartialWithoutID<User>
) {
	const u = findUser(roomId, userId);
	if (u) {
		Object.assign(u, user);
	}
}

export function editAccount(account: PartialWithoutID<User>) {
	Object.assign(appState.account, account);
	localStorage.setItem(
		LOCAL_STORAGE_ACCOUNT_KEY,
		JSON.stringify(appState.account)
	);
	for (const room of appState.rooms) {
		tryEditUser(room.id, appState.account.id, account);
	}
}
