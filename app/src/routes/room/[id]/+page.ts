import { error } from '@sveltejs/kit';
import { page } from '$app/state';
import { loadData, findRoom } from '$lib/state';

export async function load({ params }: typeof page) {
	await loadData();
	const room = params.id ? findRoom(params.id) : null;
	if (!room) {
		error(404, 'Pokój z takim ID nie istnieje');
	}
	return { room };
}
