import { page } from '$app/state';
import { error } from '@sveltejs/kit';
import { appData } from '../../../lib/states/data.svelte.ts';

export function load({ params }: typeof page) {
	const room = appData.rooms.find((r) => r.id === params.id);
	if (room === undefined) {
		error(404, 'Pokój z takim ID nie istnieje');
	}

	return {
		room
	};
}
