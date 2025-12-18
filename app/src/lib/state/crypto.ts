import { Base64 } from 'js-base64';
import type { Expense } from '$lib/state';

const ALGORITHM = 'AES-GCM';
const IV_SIZE = 12;
const KEY_SIZE = 32;

export function getRandomUUID() {
	return crypto.randomUUID();
}

export function getRandomValues(size: number) {
	return crypto.getRandomValues(new Uint8Array(size));
}

async function exportKey(key: CryptoKey) {
	return new Uint8Array(await crypto.subtle.exportKey('raw', key));
}

function importKey(raw: Uint8Array<ArrayBuffer>) {
	return crypto.subtle.importKey('raw', raw, { name: ALGORITHM }, true, [
		'encrypt',
		'decrypt'
	]);
}

function base64ToBytes(data: string) {
	return new Uint8Array(Base64.toUint8Array(data));
}

function base64FromBytes(data: Uint8Array<ArrayBuffer>, urlsafe?: boolean) {
	return Base64.fromUint8Array(data, urlsafe);
}

export async function stringifyKey(key: CryptoKey, urlsafe?: boolean) {
	return base64FromBytes(await exportKey(key), urlsafe);
}

export function parseKey(key: string) {
	return importKey(base64ToBytes(key));
}

export function generateKey() {
	return importKey(getRandomValues(KEY_SIZE));
}

export interface RoomToken {
	id: string;
	key: CryptoKey;
}

export async function createRoomToken(token: RoomToken) {
	const id = Base64.encodeURL(token.id);
	const key = await stringifyKey(token.key, true);
	return `${id}.${key}`;
}

export async function parseRoomToken(token: string): Promise<RoomToken> {
	const [id, key] = token.split('.');
	return { id: Base64.decode(id), key: await parseKey(key) };
}

export interface Room {
	name: string;
	users: {
		[uuid: string]: /* name */ string;
	};
	expenses: Expense[];
}

export interface EncryptedRoom {
	iv: string;
	data: string;
}

export async function encryptRoom(
	room: Room,
	key: CryptoKey
): Promise<EncryptedRoom> {
	const iv = getRandomValues(IV_SIZE);
	const data = await crypto.subtle.encrypt(
		{ name: ALGORITHM, iv },
		key,
		new TextEncoder().encode(
			JSON.stringify({ ...room, id: undefined, balance: undefined })
		)
	);
	return {
		iv: base64FromBytes(iv),
		data: base64FromBytes(new Uint8Array(data))
	};
}

export async function decryptRoom(
	room: EncryptedRoom,
	key: CryptoKey
): Promise<Room> {
	const iv = base64ToBytes(room.iv);
	const data = await crypto.subtle.decrypt(
		{ name: ALGORITHM, iv },
		key,
		base64ToBytes(room.data)
	);
	return JSON.parse(new TextDecoder().decode(data));
}
