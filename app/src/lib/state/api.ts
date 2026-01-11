import { toast } from 'svelte-sonner';
import * as ws from './websocket';

export enum Err {
	NOT_FOUND = 1,
	UNEXPECTED
}

type Response = [string, Err | null];

async function request(
	url: string,
	options?: Partial<RequestInit>
): Promise<Response> {
	if (options?.body !== undefined) {
		options.headers ??= {};
		//@ts-expect-error - this works as expected
		options.headers['Content-Type'] = 'application/json';
	}
	const res = await fetch(import.meta.env.VITE_API_URL + url, options);
	if (res.status === 404) {
		return ['', Err.NOT_FOUND];
	}
	const text = await res.text();
	if (options?.method === 'POST') {
		throw new Error('test');
	}
	if (res.status >= 400) {
		throw new Error(`something went wrong: ${text} (${res.status})`);
	}
	return [text, null];
}

function requestRoom(id: string, method: string, body?: string) {
	return request('/room/' + id, { method, body });
}

async function safeRequestRoom(
	id: string,
	method: string,
	body?: string
): Promise<Response> {
	try {
		const [data, err] = await requestRoom(id, method, body);
		if (err === Err.NOT_FOUND) {
			toast.error('Pokój nie istnieje');
		}
		return [data, err];
	} catch (error) {
		console.error('request error:', error);
		toast.error('Operacja nie powiodła się');
		return ['', Err.UNEXPECTED];
	}
}

export interface Room {
	iv: string;
	data: string;
}

export async function unsafeGetRoom(id: string): Promise<Room | null> {
	const [data, err] = await requestRoom(id, 'GET');
	if (err === Err.NOT_FOUND) {
		return null;
	}
	return JSON.parse(data);
}

export async function getRoom(id: string): Promise<[Room, null] | [null, Err]> {
	const [data, err] = await safeRequestRoom(id, 'GET');
	if (err) {
		return [null, err];
	}
	return [JSON.parse(data), null];
}

export async function createRoom(id: string, data: Room) {
	const [_, err] = await safeRequestRoom(id, 'POST', JSON.stringify(data));
	return err;
}

export async function editRoom(id: string, data: Room) {
	const [_, err] = await safeRequestRoom(id, 'PATCH', JSON.stringify(data));
	if (!err) {
		ws.sendRoomChange(id, data);
	}
	return err;
}

export async function deleteRoom(id: string) {
	const [_, err] = await requestRoom(id, 'DELETE');
	if (!err) {
		ws.sendRoomDelete(id);
	}
	return err;
}
