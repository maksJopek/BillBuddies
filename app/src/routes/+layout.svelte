<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { listen, TauriEvent, type UnlistenFn } from '@tauri-apps/api/event';
	import { checkPendingIntent } from 'tauri-plugin-get-pdf-api';
	import { goto } from '$app/navigation';
	import { extractPaymentFile, type PaymentData } from '$lib/pdf';
	import {
		SettingsModal,
		IconButton,
		SettingsIcon,
		RoomSelectModal,
		Toast
	} from '$lib/components';
	import { paymentShare, appState, editAccount, loadData } from '$lib/state';
	import '../app.css';

	let { children } = $props();

	let settingsModalOpen = $state(false);
	let roomSelectModalOpen = $state(false);
	let roomSelectModalPayment = $state<PaymentData>({
		amount: null,
		date: null
	});
	let toast: Toast;

	function handleOpenSettings() {
		settingsModalOpen = true;
	}

	async function handleChangeSettings(username: string) {
		await editAccount(username);
		settingsModalOpen = false;
	}

	function handleSelectRoom(id: string) {
		paymentShare.roomId = id;
		paymentShare.data = roomSelectModalPayment;
		roomSelectModalOpen = false;
		roomSelectModalPayment = { amount: null, date: null };
		goto(`/room/${id}`);
	}

	async function handleIntent() {
		const intent = await checkPendingIntent();
		if (!intent || !intent.uri) {
			return;
		}
		const data = await extractPaymentFile(intent.uri);
		if (!data) {
			return;
		}
		roomSelectModalOpen = true;
		roomSelectModalPayment = data;
	}

	let unlisten: UnlistenFn | null = null;

	onMount(async () => {
		appState.showToast = toast.show;
		await loadData();
		if (!appState.tauri) {
			return;
		}
		handleIntent();
		unlisten = await listen(TauriEvent.WINDOW_FOCUS, handleIntent);
	});

	onDestroy(() => {
		unlisten?.();
	});
</script>

<div class="app">
	<header>
		<a href="/">BillBuddies</a>
		<IconButton aria-label="settings" onclick={handleOpenSettings}>
			<SettingsIcon />
		</IconButton>
	</header>
	<main>
		{@render children()}
	</main>
</div>

<SettingsModal bind:open={settingsModalOpen} onChange={handleChangeSettings} />

<RoomSelectModal
	bind:open={roomSelectModalOpen}
	payment={roomSelectModalPayment}
	onSelect={handleSelectRoom}
/>

<Toast bind:this={toast} />

<style>
	.app {
		height: 100vh;
		width: 100%;
		background-color: var(--background);
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #1f1f1f;
	}

	a {
		color: inherit;
		font-size: 1.5rem;
		font-weight: 700;
		text-decoration: none;
		outline: none;
		border-radius: var(--border-radius);
		background-color: transparent;
		padding: 0.5rem;
		transition: background-color 0.2s ease;
	}

	a:hover,
	a:focus-visible {
		background-color: var(--background-hover);
	}

	main {
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		margin-inline: auto;
		width: 100%;
		max-width: 832px;
		gap: 2rem;
		padding: 1rem;
	}
</style>
