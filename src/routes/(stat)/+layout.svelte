<script lang="ts">
	import {base} from '$app/paths';
	import {APP_NAME} from '$lib/constants';
	const year = new Date().getFullYear();
</script>

<div id="main-footed">
	<div id="main-content">
		<slot />
	</div>
	<div id="main-foot">
		<div id="foot-r">{APP_NAME} by CCL @ {year}</div>
		<div id="foot-r"><a href={base + '/about#contact' }>Contact</a></div>
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
		padding-top: 15px;
		padding-bottom: 15px;
		background-color: var(--color-theme-yellow);
		flex: 0 0 70px;
	}

	#foot-r {
		color: var(--color-theme-darkgrey);
	}
</style>
