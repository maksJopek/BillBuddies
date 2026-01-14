<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { toast, Toaster } from 'svelte-sonner';
	import { listen, TauriEvent, type UnlistenFn } from '@tauri-apps/api/event';
	import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
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
	import {
		paymentShare,
		editAccount,
		appUnload,
		appState,
		checkLocationHash,
		exportData
	} from '$lib/state';
	import { ACCOUNT_EXPORT_HASH_PARAM, IS_TAURI } from '$lib/constants';

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

	async function handleDataExport() {
		const url = `${import.meta.env.VITE_WEB_URL}#${ACCOUNT_EXPORT_HASH_PARAM}=${exportData()}`;
		await navigator.clipboard.writeText(url);
		settingsModalOpen = false;
		toast.info('Link skopiowany do schowka. Otwórz go na nowym urządzeniu');
	}

	async function handleUsernameChange(username: string) {
		await editAccount(username);
		settingsModalOpen = false;
		toast.success('Zmieniono nazwę użytkownika');
	}

	async function handleSelectRoom(id: string) {
		paymentShare.roomId = id;
		paymentShare.data = roomSelectModalPayment;
		roomSelectModalOpen = false;
		roomSelectModalPayment = { amount: null, date: null };
		await goto(`/room/${id}`);
	}

	async function handleLoadingEffects() {
		for (const t of appState.loadingToasts) {
			const duration = t.duration;
			switch (t.type) {
				case 'success':
					toast.success(t.message, { duration });
					break;
				case 'info':
					toast.info(t.message, { duration });
					break;
				case 'warning':
					toast.warning(t.message, { duration });
					break;
				case 'error':
					toast.error(t.message, { duration });
					break;
			}
		}
		appState.loadingToasts = [];
		if (appState.loadingRedirect) {
			await goto(appState.loadingRedirect, { replaceState: true });
			appState.loadingRedirect = null;
		}
	}

	function handleOpenUrl(urls: string[]) {
		try {
			const url = new URL(urls[0]);
			checkLocationHash(url.hash);
		} catch (error) {
			console.error('deep link url error:', error);
			toast.error('Link jest nieprawidłowy');
		}
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
		handleLoadingEffects();
		if (!IS_TAURI) {
			return;
		}
		handleIntent();
		unlisten1 = await onOpenUrl(handleOpenUrl);
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
		<CheckIcon size="small" />
	{/snippet}
	{#snippet infoIcon()}
		<InfoIcon size="small" />
	{/snippet}
	{#snippet errorIcon()}
		<AlertCircleIcon size="small" />
	{/snippet}
	{#snippet warningIcon()}
		<AlertTriangleIcon size="small" />
	{/snippet}
</Toaster>

<header>
	<a href="/">BillBuddies</a>
	<div class="settings">
		<span class="settings-username">
			{appState.account.name}
		</span>
		<IconButton aria-label="settings" onclick={handleOpenSettings}>
			<SettingsIcon />
		</IconButton>
	</div>
</header>
<main>
	{@render children()}
</main>

<SettingsModal
	bind:open={settingsModalOpen}
	onDataExport={handleDataExport}
	onUsernameChange={handleUsernameChange}
/>

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
		font-size: 1.375rem;
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

	.settings {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.settings-username {
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.5px;
	}

	main {
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		margin-inline: auto;
		width: 100%;
		max-width: 832px;
		gap: 2rem;
		padding: 0.75rem 1.5rem;
	}

	@media (max-width: 480px) {
		header {
			padding: 0.625rem 0.75rem;
		}

		a {
			font-size: 1rem;
			padding: 0.25rem;
		}

		main {
			padding: 0.875rem 1rem;
		}

		.settings-username {
			font-size: 0.875rem;
		}
	}
</style>
