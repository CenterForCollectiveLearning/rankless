<script lang="ts">
	import type { LevelOutSpec, OMap } from '$lib/tree-types';
	import { fade } from 'svelte/transition';

	export let levelSpec: LevelOutSpec;
	export let index: number;
	export let selectedBreakdowns: string[];
	export let totalD1Offset: number;
	export let dBasedStyle: (d1: OMap<number>, d2: OMap<number>, d3: OMap<number>) => string;

	function semantify(s: string) {
		let sixPath = selectedBreakdowns[0] == '1-w2qs-1';
		let sMaps = [
			{
				'0-concept-hierarchy-0': 'working on <field>',
				'0-concept-hierarchy-1': 'working on <subfield>',
				'1-concept-hierarchy-0': 'are cited by papers in <field>',
				'0-country-hierarchy-0': 'co-author with scholars working in <country>',
				'1-country-hierarchy-0': 'are cited by authors working in <country>',
				'0-w2qs-0': 'publish in journals categorized as <q#>',
				'1-w2qs-1': 'are cited in papers published in <journal>'
			},
			{
				'1-concept-hierarchy-0': 'and are cited by authors working on',
				'1-concept-hierarchy-1': 'and in particular',
				'0-country-hierarchy-1': 'working at',
				'1-country-hierarchy-0': (sixPath ? '' : 'are cited ') + 'by authors in',
				'1-country-hierarchy-1': 'at',
				'0-w2qs-0': 'publish in journals categorized as',
				'0-w2qs-1': 'such as'
			},
			{
				'0-concept-hierarchy-0': 'focused on',
				'1-concept-hierarchy-1': 'and in particular in',
				'1-country-hierarchy-1': 'working at',
				'1-concept-hierarchy-0': (sixPath ? 'working ' : '') + 'on',
				'0-w2qs-1': 'such as',
				'1-w2qs-1': 'published in',
				'1-country-hierarchy-0': 'and are cited by authors working in'
			},
			{
				'0-concept-hierarchy-1': 'and in particular',
				'1-concept-hierarchy-0': 'on',
				'1-concept-hierarchy-1': 'and in particular'
			},
			{}
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
			{},
			{}
		)}
	>
		<div class="sel-base sel-cover {levelSpec.levelOptions.length > 1 ? 'sel-clicky' : ''}">
			<span>
				{semantify(selectedBreakdowns[index] || '').split('<')[0]}
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
		-webkit-appearance: menulist-button;
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
		-webkit-backdrop-filter: blur(5px);
		box-shadow: 0 0 4px 4px #ffffff80;
	}

	.filler {
		position: absolute;
		left: 0px;
		width: 100%;
		height: 100%;
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

	.sel-clicky > span::after {
		content: ' \25BD';
	}

	.sel-base > span {
		padding: 8px;
		background: #ffffff70;
		backdrop-filter: blur(10px);
		border-radius: 3px;
	}

	.sel-clicky > span {
		border: 1px solid var(--color-theme-darkblue);
		color: var(--color-theme-darkblue);
	}
</style>
