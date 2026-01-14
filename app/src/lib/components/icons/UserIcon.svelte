<script lang="ts">
	import { Icon } from '$lib/components';

	interface Props {
		size?: number;
	}

	let { size }: Props = $props();
</script>

<Icon {size}>
	<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
	<circle cx="12" cy="7" r="4"></circle>
</Icon>
