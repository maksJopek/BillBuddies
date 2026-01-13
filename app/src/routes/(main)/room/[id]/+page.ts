import { error } from '@sveltejs/kit';
import { appLoad, findRoom } from '$lib/state';

export const load = async ({ params }) => {
	await appLoad();
	const room = findRoom(params.id);
	if (!room) {
		error(404);
	}
	return { room };
};
