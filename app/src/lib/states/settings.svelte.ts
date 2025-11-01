import { appData } from './data.svelte.ts';

interface Settings {
	user: {
		id: string;
		name: string;
	};
}

const stored = localStorage.getItem('settings');
export const settings = $state<Settings>(
	stored
		? JSON.parse(stored)
		: {
				user: {
					id: crypto.randomUUID(),
					name: 'You'
				}
			}
);

export function setUserName(userName: string) {
	settings.user.name = userName;
	localStorage.setItem('settings', JSON.stringify(settings));
	for (const room of appData.rooms) {
		room.userNames[settings.user.id] = userName;
	}
}
