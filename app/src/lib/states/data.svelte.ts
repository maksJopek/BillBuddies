import { settings } from './settings.svelte';

export interface Expense {
	id: string;
	desc: string;
	amount: number;
	paidBy: string;
	date: string;
}

export interface Room {
	id: string;
	name: string;
	userNames: Record<string, string>;
	balance: number;
	expenses: Expense[];
}

interface AppData {
	rooms: Room[];
	loaded: boolean;
}

export const appData = $state<AppData>({
	rooms: [],
	loaded: false
});

export async function loadData() {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const room1Id = crypto.randomUUID();
	const room2Id = crypto.randomUUID();
	const user1Id = crypto.randomUUID();
	const user2Id = crypto.randomUUID();
	const user3Id = crypto.randomUUID();

	const fetched = [
		{
			id: room1Id,
			name: 'Apartment',
			userNames: {
				[user1Id]: 'John',
				[settings.user.id]: settings.user.name,
				[user2Id]: 'Sarah'
			},
			expenses: [
				{
					id: crypto.randomUUID(),
					desc: 'Groceries',
					amount: 45.5,
					paidBy: user1Id,
					date: '2025-10-15'
				},
				{
					id: crypto.randomUUID(),
					desc: 'Electricity',
					amount: 89.0,
					paidBy: settings.user.id,
					date: '2025-10-14'
				},
				{
					id: crypto.randomUUID(),
					desc: 'Internet',
					amount: 50.0,
					paidBy: user2Id,
					date: '2025-10-12'
				}
			]
		},
		{
			id: room2Id,
			name: 'Vacation',
			userNames: {
				[settings.user.id]: 'You',
				[user3Id]: 'Mike'
			},
			expenses: [
				{
					id: crypto.randomUUID(),
					desc: 'Hotel',
					amount: 250.0,
					paidBy: user3Id,
					date: '2025-10-10'
				},
				{
					id: crypto.randomUUID(),
					desc: 'Gas',
					amount: 60.0,
					paidBy: settings.user.id,
					date: '2025-10-09'
				}
			]
		}
	];

	appData.rooms = fetched.map((r) => ({ ...r, balance: calcBalance(r) }));

	appData.loaded = true;
}
function calcBalance(room: Omit<Room, 'balance'>) {
	const neg = Math.random() > 0.5 ? -1 : 1;
	return Math.random() * 5 * room.expenses[0].amount * neg;
}

export async function addRoom(room: Omit<Room, 'id'>) {
	appData.rooms.push({ ...room, id: crypto.randomUUID() });
}
export async function editRoom(editedRoom: Room) {
	const room = appData.rooms.find((r) => r.id === editedRoom.id)!;
	Object.assign(room, editedRoom);
}
export async function deleteRoom(room: Room) {
	appData.rooms = appData.rooms.filter((r) => r.id !== room.id);
}

export async function addExpense(roomId: string, expense: Omit<Expense, 'id'>) {
	const room = appData.rooms.find((r) => r.id === roomId)!;
	room.expenses.push({ ...expense, id: crypto.randomUUID() });
}

export async function updateExpense(roomId: string, expenseId: string, updates: Partial<Expense>) {
	const room = appData.rooms.find((r) => r.id === roomId)!;
	const expense = room.expenses.find((e) => e.id === expenseId)!;
	Object.assign(expense, updates);
}

export async function deleteExpense(roomId: string, expenseId: string) {
	const room = appData.rooms.find((r) => r.id === roomId)!;
	room.expenses = room.expenses.filter((e) => e.id !== expenseId);
}
