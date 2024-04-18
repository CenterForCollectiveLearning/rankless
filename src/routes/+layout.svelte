<script lang="ts">
	import { APP_NAME } from '$lib/constants';
	import { base } from '$app/paths';
	import './styles.css';
	import SearchLogo from '$lib/components/SearchLogo.svelte';
	import SearchResults from '$lib/components/SearchResults.svelte';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { parse } from 'platform';
	import { fade } from 'svelte/transition';

	let hPen = 0;

	let uInfo: { product?: string } = {};

	onMount(() => {
		uInfo = parse(navigator.userAgent);
		if (uInfo.product == 'iPhone' || uInfo.product == 'iPad') {
			hPen = 10;
		}
	});
	function onFocus() {
		resultsHidden = false;
	}

	function setSizes(hidden: boolean, w: number) {
		headPad = 12;
		headRightWidth = inHeight + 2;
		placeholder = '';
		inLeftPad = inHeight + 2;
		if (hidden) {
			inRight = 0;
			inputWidth = 0;
		} else {
			inputWidth = w - 4 - inLeftPad;
			inRight = 2;
		}
	}

	function toggleOpen() {
		slimOpened = !slimOpened;
	}

	afterNavigate(() => {
		slimOpened = false;
		resultsHidden = true;
	});

	const baseInW = 420;
	const basePlaceholder = 'Explore an Institution';
	const basePad = 42;
	const baseRightWidth = 220;
	const baseInLeftPad = 60;

	let innerWidth: number;

	let inHeight = 30;
	let pad = 6;
	let headPad = basePad;
	let inputWidth = baseInW;
	let headRightWidth = baseRightWidth;
	let placeholder = basePlaceholder;
	let inLeftPad = baseInLeftPad;
	let inRight = headRightWidth + headPad;
	let slimOpened = false;

	let resultsHidden = true;
	let searchTerm = '';

	$: setSizes(resultsHidden, innerWidth);
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
		rel="stylesheet"
	/>
	<title>{APP_NAME}</title>
</svelte:head>

<svelte:window bind:innerWidth />
{#if innerWidth != undefined}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div id="main-fix" transition:fade={{ duration: 100 }}>
		<div id="main-head" style="width: {inHeight + pad * 2}px">
			<SearchResults bind:resultsHidden {searchTerm} />
			<div
				id="head-l"
				style="width: {headRightWidth}px; padding-right: {headPad}px;padding: {pad}px;"
			>
				{#if resultsHidden}
					<svg
						id="slim-stripes"
						viewBox="-2 -2 22 22"
						width={inHeight}
						height={inHeight - pad}
						on:click={toggleOpen}
					>
						{#each [3, 9, 15] as sp}
							<path d="M1,{sp}h16" stroke="var(--color-theme-darkgrey)" stroke-width="1.5px" />
						{/each}
					</svg>
				{/if}
				{#if slimOpened}
					<div id="slim-drop">
						<a href={`${base}`}>Home</a>
						<a href={`${base}/about`}>About</a>
						<a href={`${base}/methods`}>Methods</a>
					</div>
				{/if}
			</div>
			<input
				bind:value={searchTerm}
				on:focus={onFocus}
				{placeholder}
				type="text"
				class="search-block"
				id="search-input"
				style="padding-left: {inLeftPad}px;height: {inHeight -
					hPen}px; right: {inRight}px; width: {inputWidth}px"
			/>
			<svg
				class="search-block"
				id="search-logo"
				width={inHeight}
				height={inHeight}
				viewBox="-10 -10 60 50"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				style="right: {inRight + inputWidth + inLeftPad - inHeight}px;"
			>
				<SearchLogo />
			</svg>
		</div>
		<through
			on:click={() => {
				slimOpened = false;
			}}
		>
			<slot />
		</through>
	</div>
{/if}

<style>
	through {
		height: 100%;
	}

	#main-fix {
		padding-top: 60px;
		display: flex;
		flex-flow: column;
		box-sizing: border-box;
		height: 100%;
	}

	#main-head {
		position: fixed;
		top: 0px;
		display: flex;
		justify-content: space-between;
		/* background-color: rgba(var(--color-range-15), 0.55); */
		background-color: var(--color-theme-yellow);
		z-index: 10;
	}

	#head-l {
		padding-right: 40px;
		display: flex;
		align-items: center;
		justify-content: end;
	}

	#slim-stripes {
		cursor: pointer;
		z-index: 10;
	}

	#slim-drop {
		position: fixed;
		z-index: 8;
		left: 0px;
		top: 0px;
		width: 93px;
		height: 120px;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		padding: 12px;
		padding-left: 20px;
		padding-top: 58px;
		background-color: var(--color-theme-yellow);
	}

	.search-block {
		position: fixed;
		top: 0px;
		transition: all 0.6s;
	}

	#search-logo {
		pointer-events: none;
		z-index: 13;
	}

	#search-input {
		border-top: solid var(--color-theme-darkblue) 3px;
		border-right: 0px;
		border-left: 0px;
		border-bottom: 0px;
		border-radius: 0px;
		background-color: rgba(255, 255, 255, 0.7);
		font-size: 24px;
		font-style: italic;
		z-index: 11;
		text-indent: 25px;
	}

	#search-input:hover {
		border-top-color: var(--color-theme-white);
		background-color: rgba(171, 171, 171, 0.8);
		color: white;
	}

	input#search-input:focus {
		outline: none;
	}
</style>
