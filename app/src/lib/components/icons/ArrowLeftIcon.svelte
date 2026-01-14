<script lang="ts">
	import { Icon, type IconProps } from '$lib/components';

	let { size }: IconProps = $props();
</script>

<Icon {size}>
	<line x1="19" y1="12" x2="5" y2="12"></line>
	<polyline points="12 19 5 12 12 5"></polyline>
</Icon>
