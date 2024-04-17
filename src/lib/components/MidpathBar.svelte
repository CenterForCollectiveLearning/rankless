<script lang="ts">
	import type { LevelOutSpec, OMap } from '$lib/tree-types';
	import { fade } from 'svelte/transition';

	export let levelSpec: LevelOutSpec;
	export let selectedBreakdowns: string[];
	export let index: number;
	export let totalD1Offset: number;
	export let dBasedStyle: (d1: OMap<number>, d2: OMap<number>) => string;

	function semantify(s: string) {
		let sMaps = [
			{
				'Detected Concept of Citing Article': 'are cited by scholars working on',
				'Cited Paper Published in Period': 'are published in',
				'Citing InstitutionType': 'are cited by scholars working at',
				'Citing Country': 'are cited by scholars affiliated with institutions in'
			},
			{
				'Citing Institution': 'specifically working at',
				'Detected Concept of Cited Article': 'cover the topic of',
				'Cited Institution': 'where the original paper was co-authored by scholars at',
				'Detected Sub-Concept of Citing Article': 'in particular'
			},
			{
				'Detected Sub-Concept of Cited Article': 'in particular',
				'Cited Paper Published in Year': 'where the original paper was published in',
				'Detected Concept of Citing Article': 'working on'
			},
			{
				'Detected Sub-Concept of Citing Article': 'in particular'
			}
		];
		return sMaps[index][s] || s;
	}
</script>

{#if levelSpec.isVisible}
	<div
		transition:fade={{ duration: 400 }}
		class="sentenceline"
		style={dBasedStyle(
			{
				top: levelSpec.topOffset + levelSpec.totalSize * 0.2 + totalD1Offset,
				height: levelSpec.totalSize * 0.25
			},
			{}
		)}
	>
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
		<div class="bg-blur filler" />
	</div>
{/if}

<style>
	select {
		cursor: pointer;
	}

	.sentenceline {
		position: fixed;
		transition: all 700ms;
		display: flex;
		justify-content: center;
		align-items: center;
		left: 10%;
		width: 80%;
		backdrop-filter: blur(10px);
		box-shadow: 0 0 8px 8px var(--color-theme-white);
		border-radius: 10px;
	}

	.filler {
		position: absolute;
		z-index: -1;
		left: 0px;
		right: 0px;
		width: 100%;
		height: 100%;
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

	.sel-clicky > span::after {
		content: ' \25BD';
	}

	.sel-clicky > span {
		border: 2px solid var(--color-theme-blue);
		padding: 12px;
		border-radius: 5px;
		background: var(--color-theme-lightblue);
	}
</style>
