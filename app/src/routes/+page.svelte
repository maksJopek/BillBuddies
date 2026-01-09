<script lang="ts">
	import { appState, createRoom, deleteRoom, editRoom } from '$lib/state';
	import * as storage from '$lib/state/storage';
	import {
		RoomCreateModal,
		RoomEditModal,
		Button,
		PlusIcon,
		RoomCard,
		List,
		Balance
	} from '$lib/components';

	let roomCreateModalOpen = $state(false);
	let roomEditModalOpen = $state(false);
	let roomEditModalId = $state('');
	let showDownloadButton = $state(defaultDownloadButtonVisibilty());
	let downloadAEl = $state<HTMLAnchorElement>();

	const downloadAppUrl = import.meta.env.VITE_WEB_URL + '/billbuddies.apk';

	const totalBalanace = $derived(
		appState.rooms.reduce((sum, room) => sum + room.balance, 0)
	);

	function handleOpenRoomCreateModal() {
		roomCreateModalOpen = true;
	}

	async function handleCreateRoom(name: string) {
		await createRoom(name);
		roomCreateModalOpen = false;
	}

	function handleOpenRoomEditModal(id: string) {
		roomEditModalOpen = true;
		roomEditModalId = id;
	}

	async function handleEditRoom(name: string) {
		await editRoom(roomEditModalId, name);
		roomEditModalOpen = false;
	}

	async function handleDeleteRoom() {
		await deleteRoom(roomEditModalId);
	}

	function defaultDownloadButtonVisibilty() {
		const saveVal = storage.getAppDownloaded();
		if (saveVal === null) {
			return appState.mobile && appState.tauri === false;
		}
		return saveVal;
	}

	function downloadApp() {
		downloadAEl?.click();
		storage.setAppDownloaded(false);
		showDownloadButton = false;
	}
</script>

<div class="top">
	<div class="balance">
		<span>Podsumowanie:</span>
		<Balance amount={totalBalanace} />
	</div>
	<Button onclick={handleOpenRoomCreateModal}>
		<PlusIcon />
		<span>Nowy pokój</span>
	</Button>
</div>
<List>
	{#each appState.rooms ?? [] as r}
		<RoomCard {...r} onEdit={() => handleOpenRoomEditModal(r.id)} />
	{/each}
</List>
{#if showDownloadButton}
	<Button class="download-mobile" onclick={downloadApp}>
		Pobierz aplikację na Android'a
	</Button>
	<a bind:this={downloadAEl} href={downloadAppUrl} download hidden title=""></a>
{/if}

<RoomCreateModal bind:open={roomCreateModalOpen} onCreate={handleCreateRoom} />

<RoomEditModal
	bind:open={roomEditModalOpen}
	id={roomEditModalId}
	onEdit={handleEditRoom}
	onDelete={handleDeleteRoom}
/>

<style>
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 2rem;
	}

	.balance {
		display: flex;
		gap: 0.5rem;
		font-weight: 500;
	}

	:global(.download-mobile) {
		position: absolute;
		bottom: 2rem;
		left: 1rem;
		font-size: 0.9em !important;
		width: 10rem;
	}
</style>
