<script lang="ts">
	import type {LevelOutSpec, OMap} from '$lib/tree-types';
	import {fade} from 'svelte/transition';

	export let levelSpec: LevelOutSpec;
	export let index: number;
	export let selectedBreakdowns: string[];
	export let totalD1Offset: number;
	export let dBasedStyle: (d1: OMap<number>, d2: OMap<number>, d3: OMap<number>) => string;

	function semantify(s: string) {
		let sMaps = [
			{
				'1-concept-hierarchy-0': 'are cited by papers covering',
				'1-w2qs-1': 'are cited by papers published in',
				'0-country-hierarchy-0': 'are authored by authors working in',
				'0-concept-hierarchy-0': 'covering the concept of',
				'1-country-hierarchy-0': 'are cited by authors working in',
				'0-w2qs-0': 'are published in journals categorized as'
			},
			{
				'1-concept-hierarchy-0': 'are cited by authors working on',
				'1-country-hierarchy-0': 'are cited by authors working in', // TODO: repeats
				'1-country-hierarchy-1': 'affiliated with',
				'1-concept-hierarchy-1': 'in particular',
				'0-concept-hierarchy-0': 'cover the topic of',
				'0-w2qs-1': 'in the journals'
			},
			{
				'1-concept-hierarchy-1': 'in particular',
				'1-country-hierarchy-1': 'affiliated with',
				'1-concept-hierarchy-0': 'working on',
				'1-w2qs-1': 'published in',
				'0-concept-hierarchy-1': 'in particular',
				'1-country-hierarchy-0': 'cited by authors working in'
			},
			{
				'1-concept-hierarchy-0': 'working on',
				'1-concept-hierarchy-1': 'in particular'
			},
			{}
		];
		return sMaps[index][s] || s;
	}
</script>

{#if levelSpec.isVisible}
<div transition:fade={{ duration: 400 }} class="sentenceline" style={dBasedStyle( { top: levelSpec.topOffset +
	levelSpec.totalSize * 0.2 + totalD1Offset, height: levelSpec.totalSize * 0.25 }, {}, {} )}>
	<div class="sel-base sel-cover {levelSpec.levelOptions.length > 1 ? 'sel-clicky' : ''}">
		<span>
			{semantify(selectedBreakdowns[index] || '')}
		</span>
	</div>
	{#if levelSpec.levelOptions.length > 1}
	<select bind:value={selectedBreakdowns[index]} class="sel-base" style="opacity: 0">
		{#each levelSpec.levelOptions as bd}
		<option value={bd}>
			{semantify(bd)}
		</option>
		{/each}
	</select>
	{/if}
	<div class="bg filler" />
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
</div>
{/if}

<style>
	span {
		text-align: center;
	}

	option {
		font-size: min(1.5rem, 3.5vw);
		text-align: center;
	}

	select {
		cursor: pointer;
	}

	.includer {
		position: absolute;
		padding: 6px;
		left: 10px;
		top: 10px;
		background-color: rgba(var(--color-range-65), 0.4);
		border-radius: 4px;
		cursor: pointer;
		z-index: 7;
	}

	.sentenceline {
		position: fixed;
		transition: all 700ms;
		display: flex;
		justify-content: center;
		align-items: center;
		left: 0%;
		width: 100%;
		backdrop-filter: blur(5px);
		box-shadow: 0 0 4px 4px #ffffff80;
	}

	.filler {
		position: absolute;
		left: 0px;
		width: 100%;
		height: 100%;
	}

	.include-box {
		position: absolute;
		left: 0px;
		top: -10svh;
		width: 100%;
		height: 30svh;
		z-index: 6;
		display: flex;
		justify-content: space-around;
		align-items: center;
		background-color: rgba(var(--color-range-15), 0.93);
	}

	.clear-button {
		cursor: pointer;
		padding: 2px;
	}

	.include-box>button {
		position: absolute;
		right: 10px;
		top: 10px;
	}

	.include-box>input {
		height: 30px;
		font-size: 1.2rem;
	}

	.include-box>div {
		padding: 15px;
		font-size: 1.6rem;
	}

	.bg {
		z-index: -1;
	}

	.sel-base {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 100%;
	}

	.sel-cover {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.sel-clicky>span::after {
		content: ' \25BD';
	}

	.sel-base>span {
		padding: 8px;
		background: #ffffff70;
		backdrop-filter: blur(10px);
		border-radius: 3px;
	}

	.sel-clicky>span {
		border: 1px solid var(--color-theme-darkblue);
		color: var(--color-theme-darkblue);
	}
</style>
