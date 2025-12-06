import type { Room } from '$lib/state/app.svelte.ts';

export function encrypt(room: Room) {
	const r = { ...room, balance: undefined, id: undefined };
	return JSON.stringify({ data: JSON.stringify(r) });
}
export function decrypt(encryptedRoom: string): Room {
	return JSON.parse(encryptedRoom);
}
