<script lang="ts">
	import { Input } from '$lib/components';

	interface Props {
		name: string;
	}

	let { name = $bindable('') }: Props = $props();
</script>

<Input
	label="Nazwa pokoju"
	type="text"
	placeholder="Berlin"
	bind:value={name}
/>
