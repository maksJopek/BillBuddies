import { sendRoomChange, sendRoomDelete } from '$lib/websocket';

async function request(url: string, options?: Partial<RequestInit>) {
	if (options?.body !== undefined) {
		options.headers ??= {};
		//@ts-expect-error - this works as expected
		options.headers['Content-Type'] = 'application/json';
	}
	const res = await fetch(import.meta.env.VITE_API_URL + url, options);
	if (res.status === 404) {
		return null;
	}
	return res.text();
}

function requestRoom(id: string, method: string, body?: string) {
	return request('/room/' + id, { method, body });
}

export interface Room {
	iv: string;
	data: string;
}

export async function getRoom(id: string) {
	const res = await requestRoom(id, 'GET');
	return res ? (JSON.parse(res) as Room) : null;
}

export async function createRoom(id: string, data: Room) {
	await requestRoom(id, 'POST', JSON.stringify(data));
}

export async function editRoom(id: string, data: Room) {
	await requestRoom(id, 'PATCH', JSON.stringify(data));
	sendRoomChange(id, data);
}

export async function deleteRoom(id: string) {
	await requestRoom(id, 'DELETE');
	sendRoomDelete(id);
}
