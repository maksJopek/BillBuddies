<script lang="ts">
	import Input from '$lib/components/Input.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { addRoom, appData, deleteRoom, editRoom, type Room } from '$lib/states/data.svelte';
	import { settings } from '$lib/states/settings.svelte';
	import { openPayment } from '$lib/pdf';
	import { goto } from '$app/navigation';

	let modalCreateShown = $state(false);
	let roomName = $state('');
	let modalEditShown = $state(false);
	let editedRoom = $state<Room>();
	let editedRoomName = $state('');
	let pdf = $state('');

	const allBalanace = $derived(appData.rooms.reduce((sum, room) => sum + room.balance, 0));

	async function saveRoom() {
		await addRoom({
			name: roomName,
			userNames: {
				[settings.user.id]: settings.user.name
			},
			balance: 0,
			expenses: []
		});
		modalCreateShown = false;
	}

	function showEditModal(e: Event, room: Room) {
		e.preventDefault();
		editedRoom = room;
		editedRoomName = room.name;
		modalEditShown = true;
	}

	async function testPDF() {
		try {
			const data = await openPayment();
			if (data) {
				pdf = JSON.stringify(data);
			} else {
				pdf = 'something went wrong';
			}
		} catch (error) {
			pdf = `${error}`;
		}
	}
</script>

<main>
	<div class="top">
		<h4>
			Podsumowanie:
			<span class:pos={allBalanace > 0} class:neg={allBalanace < 0}>
				{allBalanace.toFixed(2)}zł
			</span>
		</h4>
		<button onclick={() => (modalCreateShown = true)}>+ New Room</button>
		<button onclick={testPDF}>Test PDF</button>
	</div>
	<div class="rooms">
		{#each appData.rooms ?? [] as room}
			<button
				onclick={() => goto(`/room/${room.id}`)}
				oncontextmenu={(e) => showEditModal(e, room)}
				class="room"
			>
				{room.name}
				<span class:pos={room.balance > 0} class:neg={room.balance < 0}>
					{room.balance > 0 ? '+' : ''}{room.balance.toFixed(2)}zł
				</span>
			</button>
		{/each}
	</div>
	{pdf}
</main>

<Modal bind:open={modalCreateShown} title="Stwórz nowy pokój" onsave={saveRoom}>
	<Input label="Nazwa pokoju" type="text" bind:value={roomName} placeholder="Berlin" />
</Modal>

<Modal
	bind:open={modalEditShown}
	title={'Edytuj pokój' + roomName}
	saveText="Zapisz"
	cancelText="Usuń"
	oncancel={() => deleteRoom(editedRoom!)}
	onsave={() => editRoom({ ...editedRoom!, name: editedRoomName })}
	--cancel-btn-bg="var(--red)"
>
	<Input label="Nazwa pokoju" type="text" bind:value={editedRoomName} />
</Modal>

<style>
	main {
		display: grid;
		overflow-y: auto;
		gap: 0.5rem;
		max-width: 500px;
		max-height: 100%;
	}

	.top {
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid #1f1f1f;
	}

	.top button {
		padding: 0.5rem;
		border-radius: 0.5rem;
		background: #4f46e5;
		color: white;
		font-size: 1.25em;
	}

	.top button:hover {
		background: #1f1f1f;
		color: #e5e5e5;
		background: #4338ca;
	}

	.rooms {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		gap: 1rem;
	}

	.room {
		background-color: var(--bg-dark);
		border: 1px solid var(--border);
		margin-inline: 1rem;
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		text-decoration: none;
		cursor: pointer;
		font-size: 1em;
	}

	.room:hover {
		border-color: var(--primary);
	}

	.pos {
		color: var(--green);
	}
	.neg {
		color: var(--red);
	}
</style>
