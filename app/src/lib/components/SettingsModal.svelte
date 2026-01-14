<script lang="ts">
	import {
		Modal,
		Form,
		Input,
		Button,
		ButtonLink,
		SmartphoneIcon,
		UploadIcon,
		UserIcon
	} from '$lib/components';
	import { APK_DOWNLOAD_FILENAME, APK_DOWNLOAD_PATH } from '$lib/constants';
	import { appState, disableAppDownloadPopup } from '$lib/state';
	import { onMount } from 'svelte';
	import { IS_ANDROID_BROWSER } from '$lib/constants';

	interface Props {
		open: boolean;
		onDataExport: () => any;
		onUsernameChange: (username: string) => any;
	}

	let {
		open = $bindable(false),
		onDataExport,
		onUsernameChange
	}: Props = $props();

	let usernameForm = $state(false);
	let username = $state('');

	function handleChangeUsername() {
		username = appState.account.name;
		usernameForm = true;
	}

	async function handleUsernameFormSave() {
		await onUsernameChange(username);
		usernameForm = false;
	}

	function handleUsernameFormCancel() {
		usernameForm = false;
	}

	function handleClose() {
		open = false;
		if (appState.appDownloadPopup) {
			disableAppDownloadPopup();
		}
	}

	onMount(() => {
		if (appState.appDownloadPopup) {
			open = true;
		}
	});
</script>

<Modal bind:open title="Ustawienia">
	{#if usernameForm}
		<Form onSave={handleUsernameFormSave} onCancel={handleUsernameFormCancel}>
			<Input
				label="Twoja nazwa"
				type="text"
				placeholder="Bob"
				bind:value={username}
			/>
		</Form>
	{:else}
		<ul>
			{#if IS_ANDROID_BROWSER}
				<li>
					<ButtonLink
						href={`${import.meta.env.VITE_WEB_URL}${APK_DOWNLOAD_PATH}`}
						download={APK_DOWNLOAD_FILENAME}
						fullWidth
						spacious
						color={appState.appDownloadPopup ? 'primary' : 'neutral'}
					>
						<span>Pobierz aplikację</span>
						<span class="flex"></span>
						<SmartphoneIcon size="small" />
					</ButtonLink>
				</li>
			{/if}
			<li>
				<Button fullWidth spacious color="neutral" onclick={onDataExport}>
					<span>Eksportuj dane</span>
					<span class="flex"></span>
					<UploadIcon size="small" />
				</Button>
			</li>
			<li>
				<Button
					fullWidth
					spacious
					color="neutral"
					onclick={handleChangeUsername}
				>
					<span>Zmień nazwę użytkownika</span>
					<span class="flex"></span>
					<UserIcon size="small" />
				</Button>
			</li>
		</ul>
		<Button fullWidth color="neutral" onclick={handleClose}>Zamknij</Button>
	{/if}
</Modal>

<style>
	ul {
		gap: 0.5rem;
		padding-bottom: 2rem;
	}
</style>
