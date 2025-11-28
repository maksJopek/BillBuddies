<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { Field } from '$lib/components';
	import './Input.css';

	interface Props extends Omit<HTMLSelectAttributes, 'id'> {
		label: string;
		children: Snippet;
	}

	const id = $props.id();

	let {
		children,
		label,
		value = $bindable(),
		class: className,
		...props
	}: Props = $props();
</script>

<Field {id} {label}>
	<select {id} bind:value {...props} class={['Input', className]}>
		{@render children()}
	</select>
</Field>
