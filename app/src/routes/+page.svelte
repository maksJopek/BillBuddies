<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { listen, TauriEvent, type UnlistenFn } from '@tauri-apps/api/event';
	import { checkPendingIntent } from 'tauri-plugin-get-pdf-api';
	import { extractPayment } from '$lib/pdf';
	import { appState, addRoom, deleteRoom, editRoom } from '$lib/state';
	import {
		RoomCreateModal,
		RoomEditModal,
		type RoomFormProps,
		Button,
		PlusIcon,
		RoomCard,
		List
	} from '$lib/components';
	import Balance from '$lib/components/shared/Balance.svelte';

	let roomCreateModalOpen = $state(false);
	let roomEditModalOpen = $state(false);
	let roomEditModalId = $state('');

	const totalBalanace = $derived(
		appState.rooms.reduce((sum, room) => sum + room.balance, 0)
	);

	function handleOpenRoomCreateModal() {
		roomCreateModalOpen = true;
	}

	function handleCreateRoom(room: RoomFormProps) {
		addRoom({
			...room,
			balance: 0,
			users: [{ ...appState.account }],
			expenses: []
		});
		roomCreateModalOpen = false;
	}

	function handleOpenRoomEditModal(id: string) {
		roomEditModalOpen = true;
		roomEditModalId = id;
	}

	function handleEditRoom(room: RoomFormProps) {
		editRoom(roomEditModalId, room);
		roomEditModalOpen = false;
	}

	function handleDeleteRoom() {
		deleteRoom(roomEditModalId);
	}

	async function handleIntent() {
		const intent = await checkPendingIntent();
		if (!intent || !intent.uri) {
			return;
		}
		await extractPayment(intent.uri);
		// TODO
	}

	let unlisten: UnlistenFn | null = null;

	onMount(async () => {
		if (!('__TAURI__' in window)) {
			return;
		}
		handleIntent();
		unlisten = await listen(TauriEvent.WINDOW_FOCUS, handleIntent);
	});

	onDestroy(() => {
		unlisten?.();
	});
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
</style>
