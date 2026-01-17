import * as crypto from './crypto';
import {
	appReload,
	appState,
	findRoom,
	calcRoomBalance,
	deleteRoom
} from './app.svelte';

interface Message extends crypto.EncryptedRoom {
	id: string;
	type: 'change' | 'delete';
}

let ws: WebSocket | null = null;

export async function connect() {
	if (ws !== null) {
		return;
	}
	const url = import.meta.env.VITE_API_URL.replace('http', 'ws');
	ws = new WebSocket(`${url}/ws`);
	ws.onmessage = async (e) => {
		const msg: Message = JSON.parse(e.data);
		if (msg.type === 'change') {
			const roomData = await crypto.decryptRoom(msg, appState.roomKeys[msg.id]);
			if (!roomData) {
				throw new Error("can't decrypt room");
			}
			const room = findRoom(msg.id);
			Object.assign(room, {
				...roomData,
				balance: calcRoomBalance(roomData)
			});
		} else if (msg.type === 'delete') {
			await deleteRoom(msg.id, true);
		}
	};
	return new Promise<void>((res, rej) => {
		ws!.onopen = () => {
			ws!.onclose = (event) => {
				if (!event.wasClean) {
					console.error('websocket close:', event);
					appReload();
				}
				ws = null;
			};
			res();
		};
		ws!.onerror = (event) => {
			console.error('websocket error:', event);
			ws = null;
			rej();
		};
	});
}

// avoid error cascade
function acquire() {
	if (ws === null || ws.readyState !== ws.OPEN) {
		return null;
	}
	return ws;
}

function send(value: any) {
	acquire()?.send(JSON.stringify(value));
}

export function listenOnRoom(id: string) {
	send({ type: 'listen_on_room', id });
}

export function sendRoomChange(id: string, data: crypto.EncryptedRoom) {
	send({
		type: 'broadcast',
		id,
		data: JSON.stringify({ ...data, id, type: 'change' })
	});
}

export function sendRoomDelete(id: string) {
	send({
		type: 'broadcast',
		id,
		data: JSON.stringify({ id, type: 'delete' })
	});
}

export function disconnect() {
	acquire()?.close();
	ws = null;
}
