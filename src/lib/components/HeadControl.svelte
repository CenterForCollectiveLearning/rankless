<script lang="ts">
	export let hoverToggle: boolean;
	export let checked: boolean;
	export let checkBox = true;
	export let interactText = true;
</script>

<div id="spec-container">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<span id="spec-info-hover" class="small-hover" on:mouseover={()=> {
		hoverToggle = true;
		}}
		on:mouseleave={() => {
		hoverToggle = false;
		}}>i</span>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span id="spec-label" class="small-hover" on:click={()=> {
		if (interactText) {
		checked = !checked;
		}
		}}
		>
		<slot />
	</span>
	{#if checkBox}
	<input type="checkbox" bind:checked />
	{/if}
</div>

<style>
	#spec-label {
		margin: min(9px, 1.2vw);
		cursor: pointer;
	}

	#spec-container {
		width: 100%;
		max-width: 240px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	#spec-info-hover {
		font-size: 0.7rem;
		border: 1px solid var(--color-theme-darkgrey);
		padding: 4px;
		padding-left: 8px;
		padding-right: 8px;
		border-radius: 1rem;
		cursor: pointer;
	}

	#spec-info-hover:hover {
		color: var(--color-theme-darkblue);
		border: 1.2px solid var(--color-theme-darkblue);
		background-color: var(--color-theme-white);
	}

	.small-hover {
		font-size: min(0.7rem, 2.2vw);
	}
</style>
