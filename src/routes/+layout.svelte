<script lang="ts">
	import { APP_NAME } from '$lib/constants';
	import { base } from '$app/paths';
	import './styles.css';
	import SearchLogo from '$lib/components/SearchLogo.svelte';
	import SearchResults from '$lib/components/SearchResults.svelte';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { parse } from 'platform';
	import { blur, fade, slide } from 'svelte/transition';

	import rootSpecs from '$lib/assets/data/root-basics.json';

	let runner: number;
	let hPen = 0;
	let uInfo: { product?: string } = {};

	onMount(() => {
		uInfo = parse(navigator.userAgent);
		if (uInfo.product == 'iPhone' || uInfo.product == 'iPad') {
			hPen = 10;
		}
		runner = setInterval(changeText, speed);
	});
	function init(el) {
		el.focus();
	}
	function onFocus() {
		resultsHidden = false;
	}

	function toggleOpen() {
		slimOpened = !slimOpened;
	}

	afterNavigate(() => {
		slimOpened = false;
		resultsHidden = true;
	});

	let innerWidth: number;

	let slimOpened = false;

	let resultsHidden = true;
	let searchTerm = '';

	let speed = 70;
	let stopAtEnd = 350;
	let texts = rootSpecs.map((r) => r.entity_type);
	let wordInd = 0;
	let text = texts[wordInd];
	$: basePlaceholder = 'Explore ' + text;

	let letterInd = Math.floor(text.length / 2);
	let direction = +1;

	function changeText() {
		if (wordInd == texts.length) {
			wordInd = 0;
		}
		let word = texts[wordInd];
		text = word.slice(0, letterInd);
		if (letterInd == word.length) {
			clearInterval(runner);
			setTimeout(() => {
				runner = setInterval(changeText, speed);
			}, stopAtEnd);
		}
		letterInd += direction;
		if (letterInd == word.length) {
			direction = -1;
		}
		if (letterInd == 0) {
			direction = 1;
			wordInd = wordInd + 1;
		}
	}

	$: placeholder = resultsHidden ? '' : basePlaceholder;
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap"
		rel="stylesheet"
	/>
	<meta
		name="description"
		content="Explore academic impact beyond rankings. Rankless offers a fresh perspective on how universities influence each geography and topic, emphasizing diverse forms of impact and providing a richer understanding of academic influence."
	/>
	<meta
		property="og:image"
		content="http://tmp-borza-public-cyx.s3.amazonaws.com/rankless-meta.png"
	/>
	<title>{APP_NAME}</title>
</svelte:head>

<svelte:window bind:innerWidth />
{#if innerWidth != undefined}
	<SearchResults bind:resultsHidden {searchTerm} />
	{#if !resultsHidden}
		<input
			transition:blur={{ amount: 10, duration: 300 }}
			bind:value={searchTerm}
			on:focus={onFocus}
			use:init
			{placeholder}
			type="text"
			id="search-input"
		/>
	{/if}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div id="main-fix" transition:fade={{ duration: 100 }}>
		<div id="main-head">
			{#if resultsHidden}
				<div id="head-l" class="head-side-elem">
					<svg id="slim-stripes" viewBox="-2 -2 22 22" on:click={toggleOpen}>
						{#each [3, 9, 15] as sp}
							<path d="M1,{sp}h16" stroke="var(--color-theme-darkgrey)" stroke-width="1.5px" />
						{/each}
					</svg>
					{#if slimOpened}
						<div transition:slide={{ duration: 400 }} id="slim-drop">
							<a href={`${base}/`}>Home</a>
							<a href={`${base}/about`}>About</a>
						</div>
					{/if}
				</div>
				<div class="head-side-elem" id="head-r" on:click={onFocus}>
					<svg
						id="search-logo"
						viewBox="-10 -10 60 50"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<SearchLogo />
					</svg>
				</div>
			{/if}
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

	svg {
		--svg-size: min(min(30px, 5.5vw), 3.8svh);
		width: var(--svg-size);
		height: var(--svg-size);
	}

	.head-side-elem {
		padding: 7px;
		margin: min(min(17px, 2vw), 1.7svh);
		border: solid var(--color-theme-darkblue) 2px;
		border-radius: 8px;
		box-shadow: 3px 3px 10px var(--color-theme-darkgrey2);
		cursor: pointer;
		background-color: var(--color-theme-white);
		z-index: 10;
		pointer-events: auto;
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
		width: 100%;
		top: 0px;
		display: flex;
		justify-content: space-between;
		align-items: start;
		z-index: 2;
		pointer-events: none;
	}

	#head-l {
		padding-bottom: 4px;
	}

	#head-r {
		padding-top: 1px;
		border-top: solid var(--color-theme-darkblue) 7px;
	}

	#slim-stripes {
		cursor: pointer;
		z-index: 10;
	}

	#slim-drop {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		padding: 9px;
	}

	#slim-drop > a {
		padding: 3px;
	}

	#search-logo {
		position: relative;
		left: 0px;
		top: 0px;
		pointer-events: none;
		z-index: 7;
	}

	#search-input {
		position: fixed;
		top: 17px;
		left: 0px;
		width: 100%;
		height: 45px;
		transition: all 0.6s;
		border-top: solid var(--color-theme-darkblue) 3px;
		border-right: 0px;
		border-left: 0px;
		border-bottom: 0px;
		border-radius: 0px;
		background-color: rgba(255, 255, 255, 0.95);
		font-size: 24px;
		font-style: italic;
		z-index: 25;
		text-indent: 25px;
	}

	#search-input:hover {
		border-top-color: var(--color-theme-white);
		background-color: rgba(171, 171, 171, 0.9);
		color: white;
	}

	input#search-input:focus {
		outline: none;
	}
</style>
