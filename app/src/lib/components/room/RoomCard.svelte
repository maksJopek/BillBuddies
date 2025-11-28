<script lang="ts">
	import { Balance } from '$lib/components';

	interface Props {
		id: string;
		name: string;
		balance: number;
		onEdit: () => any;
	}

	let { id, name, balance, onEdit }: Props = $props();

	function handleContextMenu(e: Event) {
		e.preventDefault();
		onEdit();
	}
</script>

<li oncontextmenu={handleContextMenu}>
	<a href={`/room/${id}`}>
		<span>
			{name}
		</span>
		<Balance amount={balance} plusSign />
	</a>
</li>

<style>
	a {
		width: 100%;
		display: flex;
		justify-content: space-between;
		background-color: var(--surface);
		border: 2px solid var(--border);
		border-radius: var(--border-radius);
		padding: 1rem;
		cursor: pointer;
		transition: border-color 0.2s ease;
		outline: none;
		text-decoration: none;
		color: inherit;
	}

	a:hover,
	a:focus-visible {
		border-color: var(--primary);
	}
</style>
