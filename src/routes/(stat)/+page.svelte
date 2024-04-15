<script lang="ts">
	import {flowerPaths, thinFlowerPaths} from '$lib/visual-util';
	import HexagonLogo from '$lib/components/HexagonLogo.svelte';
	import Flower from '$lib/components/Flower.svelte';
	import CircleBurst from '$lib/components/CircleBurst.svelte';
	import ScrollySank from '$lib/components/ScrollySank.svelte';

	let scrollYRaw: number;
	let innerHeight: number;
	let outerHeight: number;
	let innerWidth: number;

	let minInHeight = 100000;

	function updateInHeight(newHeight: number) {
		if (newHeight < minInHeight) {
			minInHeight = newHeight;
		}
		return minInHeight;
	}

	$: scrollY = scrollYRaw;
	$: sHeight = updateInHeight(innerHeight);
	$: sWidth = innerWidth || 2000;
	$: isWideScreen = sWidth / sHeight > 1.2;
	$: rotScaler = scrollY / 1000 + 1.2;

	function getFixVhFun(height: number, scroll: number) {
		return (start_vh: number, end_vh: number, offset_vh: number) => {
			const scrolled_svh = (scroll / height) * 100;

			let onum = offset_vh;

			if (scrolled_svh < start_vh) {
				onum += start_vh - scrolled_svh;
			} else if (scrolled_svh > end_vh) {
				onum += end_vh - scrolled_svh;
			}
			return `${onum}svh`;
		};
	}

	$: fixedPin = getFixVhFun(sHeight, scrollY);
	$: rateScale = (srate: number, frate: number) =>
		Math.max(0, Math.min((scrollY / sHeight - srate) / frate, 1));
	$: lrMove = (start: number, stay: number) =>
		isWideScreen
			? 100 - rateScale(start, 0.4) * 50 + rateScale(start + stay, 0.4) * 50
			: -94 + rateScale(start, 0.4) * 100 + rateScale(start + stay, 0.4) * 100;
</script>

<svelte:window bind:scrollY={scrollYRaw} bind:innerHeight bind:outerHeight bind:innerWidth />

<div id="main-container" style="--pwidth: {isWideScreen ? '38%' : '90%'}">
	<!-- text -->
	<p id="p-1" style="opacity: {100 - rateScale(0, 0.2) * 100}%;">
		In a world where every country dreams of becoming a knowledge powerhouse, we need more than
		university rankings.
	</p>
	<p id="p-2" style="top: {fixedPin(70, 110, 30)};">
		Universities are a source of <span style={scrollY / sHeight> 0.6 ? 'color: var(--color-theme-red);' :
			''}
			>cultural and economic growth</span>. They attract talent, educate the population, and help
		produce important innovations.
	</p>
	<p id="p-3" style="top: {isWideScreen ? fixedPin(120, 185, 20) : fixedPin(140, 160, 45)};{isWideScreen
			? ''
			: 'width: 80%'}">
		But the impact of universities cannot be reduced to a single number. <b>Knowledge is highly
			specific</b>, and so is the impact of universities.
	</p>
	<p id="p-4" style="top: {fixedPin(225, 280, 40)};opacity: {100 - rateScale(2.9, 0.2) * 100}%;{isWideScreen
			? ''
			: 'width: 75%'}">
		<span style="opacity: {100 - rateScale(2.4, 0.2) * 100}%">
			Universities specialize in <b>fields</b> and build local
			<b>networks of collaboration</b>.</span>
		<span id="inner-4" style="opacity: {rateScale(2.4, 0.2) * 100}%">
			Isn’t it time we understand them in their right context?
		</span>
	</p>
	<p id="p-5" style="top: {fixedPin(330, 400, 45)}; right: {7 -
			rateScale(3.6, 0.7) * 107}%; width: {isWideScreen ? 38 : 72}%">
		Take <b class="osu">Oregon State University</b> and the
		<b class="bologna">University of Bologna</b>. Looking at them as elements of a list of
		universities with varied focuses, sizes and locations, helps us little in differentiating their
		impact that is embedded in a complex network of citations.
	</p>

	<p id="p-5-1" class={isWideScreen ? '' : 'bottom-text' } style="top: {isWideScreen
			? fixedPin(440, 470, 30)
			: fixedPin(480, 570, 62)}; width: {isWideScreen ? 38 : 82}%; left: {isWideScreen
			? 50
			: 6 + rateScale(5.0, 0.4) * 100}%;">
		We built a tool where you can visualize and explore their impact, and break it down in a way
		that can tell a story about them, without condensing it to a number, or a range in a ranking.
	</p>
	<p id=" p-5-2" class={isWideScreen ? '' : 'bottom-text' }
		style="top: {fixedPin(500, 750, isWideScreen ? 35 : 61)};left: {lrMove(5.0, 1.3)}%">
		Stories like how authors affiliated with <b class="osu">Oregon State</b> published a number of
		successfuld papers cited by authors working on <b id="geol">geology</b>
		and
		<b id="geog">geography</b>, working at prestigious institutions around the world
	</p>
	<p id="p-5-3" class={isWideScreen ? '' : 'bottom-text' }
		style="top: {fixedPin(580, 860, isWideScreen ? 35 : 61)};left: {lrMove(6.4, 1.3)}%">
		How the <b class="bologna">University of Bologna</b> built relationships in Chile or Poland through
		citations in the field of Mathematics and Physics
	</p>

	<p id="p-6" style="top: {fixedPin(910, 990, 20)};">
		Academic impact is a rich kaleidoscope of topics and geographies that can be exciting to
		explore.
	</p>
	<p id="p-7" style="top: {isWideScreen ? 40 : 60}svh;opacity: {rateScale(8.9, 0.2) * 100}%">
		Go ahead and explore impact beyond rankings!
	</p>
	<!-- graphs -->
	<ScrollySank {sWidth} {sHeight} {fixedPin} {rateScale} {isWideScreen} />

	<!-- decoration -->
	<div class="bg-bar" id="top-blue" />
	{#each [...Array(7).keys()].map((x) => 22 + x * 3.75 * (2 - (scrollY / sHeight) * 4)) as topOff}
	<div class="white-line" style="top: {topOff}svh" />
	{/each}
	<div class="bg-bar" id="mid-pink" />
	<div class="bg-bar" id="purp-bar" />
	<div class="bg-bar" id="grey-bar" />

	<svg id="logo-img" viewBox="-2.5 -2 4.9 5.3" xmlns="http://www.w3.org/2000/svg"
		style="opacity: {innerWidth > innerHeight ? 70 : 0}%;">
		<HexagonLogo {rotScaler} />
	</svg>

	<svg id="thin-flower-img" viewBox="0 -150 1000 1700" xmlns="http://www.w3.org/2000/svg">
		<Flower paths={thinFlowerPaths} width={6} color="var(--color-theme-lightblue)" />
	</svg>

	<svg id="flower-img" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
		<Flower paths={flowerPaths} color="var(--color-theme-purple)" />
	</svg>

	<svg id="burst-1" viewBox="-115 -115 900 900" xmlns="http://www.w3.org/2000/svg">
		<CircleBurst />
	</svg>

	<svg id="final-thin-flower" viewBox="-500 -300 1000 1700" xmlns="http://www.w3.org/2000/svg">
		<Flower paths={thinFlowerPaths} width={3} color="var(--color-theme-blue)" />
	</svg>
</div>

<style>
	#main-container {
		height: 1000svh;
	}

	p {
		padding: 0px;
		margin: 0px;
		font-size: min(5svh, 7vw);
		font-weight: 400;
		line-height: 1.5;
		position: fixed;
		z-index: 6;
		width: var(--pwidth);
	}

	#p-1 {
		position: absolute;
		top: 19svh;
		color: var(--color-theme-darkblue);
		font-weight: 600;
		left: 40px;
	}

	#p-2 {
		color: var(--color-theme-darkblue);
		text-align: right;
		right: 40px;
	}

	#p-2>span {
		font-weight: 600;
		transition: color 300ms;
	}

	#p-3 {
		left: 5%;
	}

	#p-4 {
		right: 5%;
		text-align: right;
	}

	#p-5 {
		padding: 2vw;
		font-size: min(3.5svh, 6vw);
		text-align: right;
	}

	#p-6 {
		left: 8%;
	}

	#p-7 {
		right: 9%;
		text-align: right;
	}

	#geol {
		color: rgb(var(--color-range-25));
	}

	#geog {
		color: rgb(var(--color-range-75));
	}

	#inner-4 {
		font-weight: 600;
		color: var(--color-theme-darkblue);
	}

	.bottom-text {
		font-size: 2.6svh;
	}

	.osu {
		color: rgba(var(--color-range-5), 0.7);
	}

	.bologna {
		color: rgba(var(--color-range-55), 0.7);
	}

	/* decorations */

	.white-line {
		width: 100%;
		height: min(2.5svh, 3.5vw);
		opacity: 20%;
		position: absolute;
		z-index: -8;
		background-color: var(--color-theme-white);
		opacity: 80%;
	}

	.bg-bar {
		position: absolute;
		z-index: -9;
		width: 100%;
	}

	#top-blue {
		height: 80svh;
		top: 0px;
		opacity: 60%;
		background-image: linear-gradient(var(--color-theme-lightblue),
				var(--color-theme-blue) 20%,
				var(--color-theme-lightgrey));
	}

	#mid-pink {
		position: absolute;
		height: 70svh;
		opacity: 80%;
		top: 120svh;
		background-image: linear-gradient(var(--color-theme-pink), var(--color-theme-lightblue));
	}

	#purp-bar {
		position: absolute;
		height: 90svh;
		width: 75%;
		margin-left: 25%;
		top: 350svh;
		background-image: linear-gradient(180deg,
				var(--color-theme-pink) 12.5%,
				var(--color-theme-purple) 46%,
				var(--color-theme-purple) 70%,
				rgba(255, 255, 255, 0) 100%);
	}

	#grey-bar {
		position: absolute;
		height: 340svh;
		top: 460svh;
		background-image: linear-gradient(0deg,
				rgba(255, 255, 255, 0),
				rgba(255, 255, 255, 0) 20%,
				var(--color-theme-lightgrey) 30%,
				var(--color-theme-pink) 70%,
				rgba(255, 255, 255, 0) 80%,
				rgba(255, 255, 255, 0) 100%);
	}

	svg {
		position: absolute;
		z-index: -5;
	}

	#logo-img {
		height: 70svh;
		top: 10%;
		transition: opacity 200ms linear;
		right: 0px;
	}

	#thin-flower-img {
		width: min(1333px, 100%);
		top: 550px;
		left: 0px;
		opacity: 30%;
		z-index: -6;
	}

	#burst-1 {
		width: 66%;
		top: 360svh;
	}

	#flower-img {
		width: 80%;
		top: 670svh;
		left: 4%;
	}

	#final-thin-flower {
		height: 105.5svh;
		/* WHY? the height should match main-container height*/
		width: 100%;
		left: 0px;
		top: 855svh;
		position: absolute;
		opacity: 40%;
	}
</style>
