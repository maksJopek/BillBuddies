import { decryptRoom, type EncryptedRoom } from '$lib/state/crypto';
import { appState, findRoom, calcRoomBalance, deleteRoom } from '$lib/state';

interface WSMessage extends EncryptedRoom {
	id: string;
	type: 'change' | 'delete';
}

let ws: WebSocket | null = null;

export async function connectWS() {
	if (ws !== null) {
		return;
	}
	ws = new WebSocket(import.meta.env.VITE_API_URL + '/ws');
	ws.onmessage = async (e) => {
		const msg: WSMessage = JSON.parse(e.data);
		if (msg.type === 'change') {
			const roomData = await decryptRoom(msg, appState.roomKeys[msg.id]);
			const room = findRoom(msg.id);
			Object.assign(room, {
				...roomData!,
				balance: calcRoomBalance(roomData!)
			});
		} else if (msg.type === 'delete') {
			await deleteRoom(msg.id, true);
		}
	};
	ws.onclose = reconnectWS;
	ws.onerror = reconnectWS;
	return new Promise<void>((res) => (ws!.onopen = () => res()));
}
export function listenOnRoom(id: string) {
	ws!.send(JSON.stringify({ type: 'listen_on_room', id }));
}
export function sendRoomChange(id: string, data: EncryptedRoom) {
	ws!.send(
		JSON.stringify({
			type: 'broadcast',
			id,
			data: JSON.stringify({ ...data, id, type: 'change' })
		})
	);
}
export function sendRoomDelete(id: string) {
	ws!.send(
		JSON.stringify({
			type: 'broadcast',
			id,
			data: JSON.stringify({ id, type: 'delete' })
		})
	);
}
export function disconnectWS() {
	if (ws === null) {
		return;
	}
	ws.onclose = null;
	ws.close();
	ws = null;
}
let reconnectCount = 0;
function reconnectWS() {
	reconnectCount++;
	ws = null;
	if (reconnectCount > 3) {
		throw new Error("Can't connect to websocket");
	}
	setTimeout(connectWS, 1000);
}
