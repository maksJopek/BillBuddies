<script module lang="ts">
	export interface Props {
		name: string;
	}
</script>

<script lang="ts">
	import { Input } from '$lib/components';

	let { name = $bindable('') }: Props = $props();
</script>

<Input
	label="Nazwa pokoju"
	type="text"
	placeholder="Berlin"
	bind:value={name}
/>
