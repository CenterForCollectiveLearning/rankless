<script lang="ts">
	import { base } from '$app/paths';
	import TextedLogo from '$lib/components/TextedLogo.svelte';
</script>

<div id="main-footed">
	<div id="main-content">
		<slot />
	</div>
	<div id="main-foot">
		<TextedLogo pad={0} size={30} />
		<div id="foot-r"><a href={base + '/about#contact'}>Contact</a></div>
	</div>
</div>

<style>
	#main-footed {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	#main-content {
		flex: 1 1 auto;
	}

	#main-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-left: 3vw;
		padding-right: 3vw;
		padding-top: 3px;
		padding-bottom: 3px;
		background-color: var(--color-theme-yellow);
		flex: 0 0 50px;
		z-index: 1;
		height: min(50px, 3svh);
	}

	#foot-r {
		color: var(--color-theme-darkgrey);
	}
</style>
