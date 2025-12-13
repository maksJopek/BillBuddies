<script lang="ts">
	interface Props {
		showFor?: string;
	}
	let { showFor = '3s' }: Props = $props();

	let toastDiv: HTMLDivElement;

	let shown = $state(false);
	let msg = $state('');
	export function show(message: string) {
		shown = true;
		msg = message;

		let i = 0;
		toastDiv.onanimationend = () => i++ && (shown = false);
	}
</script>

<div
	class="toast"
	class:show={shown}
	bind:this={toastDiv}
	style:--show-for={showFor}
>
	{msg}
</div>

<style>
	.toast {
		--bottom: 30px;
		bottom: var(--bottom);
		visibility: hidden;
		min-width: 200px;
		background-color: var(--primary);
		text-align: center;
		border-radius: 1vh;
		padding: 16px;
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
	}

	.toast.show {
		visibility: visible;
		animation:
			fadein 0.5s,
			fadeout 0.5s var(--show-for);
	}

	@keyframes fadein {
		from {
			bottom: 0;
			opacity: 0;
		}
		to {
			bottom: var(--bottom);
			opacity: 1;
		}
	}
	@keyframes fadeout {
		from {
			bottom: var(--bottom);
			opacity: 1;
		}
		to {
			bottom: 0;
			opacity: 0;
		}
	}
</style>
