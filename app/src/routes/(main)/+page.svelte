<script lang="ts">
	import { onMount } from 'svelte';
	import {
		appState,
		createRoom,
		deleteRoom,
		editRoom,
		checkRoomToken
	} from '$lib/state';
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

	onMount(checkRoomToken);
</script>

<svelte:window onhashchange={checkRoomToken} />

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
