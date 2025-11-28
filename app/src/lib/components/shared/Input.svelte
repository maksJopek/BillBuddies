<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Field } from '$lib/components';
	import './Input.css';

	interface Props extends Omit<HTMLInputAttributes, 'id'> {
		label: string;
	}

	const id = $props.id();

	let {
		label,
		value = $bindable(),
		class: className,
		...props
	}: Props = $props();
</script>

<Field {id} {label}>
	<input
		{id}
		bind:value
		autocomplete="off"
		{...props}
		class={['Input', className]}
	/>
</Field>
