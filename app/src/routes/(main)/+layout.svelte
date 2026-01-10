<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { toast, Toaster } from 'svelte-sonner';
	import { listen, TauriEvent, type UnlistenFn } from '@tauri-apps/api/event';
	import {
		getCurrent as getCurrentUrls,
		onOpenUrl
	} from '@tauri-apps/plugin-deep-link';
	import { checkPendingIntent } from 'tauri-plugin-get-pdf-api';
	import { goto } from '$app/navigation';
	import { extractPaymentFile, type PaymentData } from '$lib/pdf';
	import {
		SettingsModal,
		IconButton,
		SettingsIcon,
		RoomSelectModal,
		CheckIcon,
		InfoIcon,
		AlertCircleIcon,
		AlertTriangleIcon
	} from '$lib/components';
	import { paymentShare, editAccount, appUnload } from '$lib/state';
	import { IS_TAURI } from '$lib/constants';

	let { children } = $props();

	let settingsModalOpen = $state(false);
	let roomSelectModalOpen = $state(false);
	let roomSelectModalPayment = $state<PaymentData>({
		amount: null,
		date: null
	});

	function handleOpenSettings() {
		settingsModalOpen = true;
	}

	async function handleChangeSettings(username: string) {
		await editAccount(username);
		settingsModalOpen = false;
		toast.success('Zmieniono nazwę użytkownika');
	}

	function handleSelectRoom(id: string) {
		paymentShare.roomId = id;
		paymentShare.data = roomSelectModalPayment;
		roomSelectModalOpen = false;
		roomSelectModalPayment = { amount: null, date: null };
		goto(`/room/${id}`);
	}

	function handleOpenUrl(urls: string[]) {
		// TODO
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

	let unlisten1: UnlistenFn | null = null;
	let unlisten2: UnlistenFn | null = null;

	onMount(async () => {
		if (!IS_TAURI) {
			return;
		}
		const urls = await getCurrentUrls();
		if (urls) {
			handleOpenUrl(urls);
		}
		unlisten1 = await onOpenUrl(handleOpenUrl);
		handleIntent();
		unlisten2 = await listen(TauriEvent.WINDOW_FOCUS, handleIntent);
	});

	onDestroy(() => {
		appUnload();
		unlisten1?.();
		unlisten2?.();
	});
</script>

<Toaster
	position="bottom-center"
	toastOptions={{ unstyled: true, class: 'toast' }}
>
	{#snippet successIcon()}
		<CheckIcon size={20} />
	{/snippet}
	{#snippet infoIcon()}
		<InfoIcon size={20} />
	{/snippet}
	{#snippet errorIcon()}
		<AlertCircleIcon size={20} />
	{/snippet}
	{#snippet warningIcon()}
		<AlertTriangleIcon size={20} />
	{/snippet}
</Toaster>

<header>
	<a href="/">BillBuddies</a>
	<IconButton aria-label="settings" onclick={handleOpenSettings}>
		<SettingsIcon />
	</IconButton>
</header>
<main>
	{@render children()}
</main>

<SettingsModal bind:open={settingsModalOpen} onChange={handleChangeSettings} />

<RoomSelectModal
	bind:open={roomSelectModalOpen}
	payment={roomSelectModalPayment}
	onSelect={handleSelectRoom}
/>

<style>
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
