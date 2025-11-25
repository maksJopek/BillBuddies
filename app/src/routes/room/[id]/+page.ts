import { error } from '@sveltejs/kit';
import { page } from '$app/state';
import { findRoom } from '$lib/state';

export function load({ params }: typeof page) {
	const room = params.id ? findRoom(params.id) : null;
	if (!room) {
		error(404, 'Pokój z takim ID nie istnieje');
	}
	return { room };
}
