<script lang="ts">
	import { fade } from 'svelte/transition';

	export let value: number;
	export let min: number;
	export let max: number;
	export let width: number;
	export let duration = 400;

	export let sliderHeight = 30;
	export let labelWidth = 30;
	export let thumbWidth = 80;
	$: thumbHeight = sliderHeight - 4;
	$: sliderWidth = width || 0 - labelWidth * 2;
	$: r = ((sliderWidth - thumbWidth) * (value - min)) / (max - min);
</script>

<div
	id="topn-control"
	transition:fade={{ duration }}
	style="--slider-width: {sliderWidth}px; --label-width: {labelWidth}px; --thumb-width: {thumbWidth}px; --slider-height: {sliderHeight}px; --thumb-height: {thumbHeight}px; --r: {r}px"
>
	<div id="topn-slider">
		<input id="topn-input" type="range" {min} {max} bind:value />
	</div>
	<label for="topn-input"><span>−</span><span>+</span></label>
</div>

<style>
	#topn-control {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	#topn-control > label {
		text-align: center;
		position: absolute;
		font-weight: 600;
		width: var(--thumb-width);
		height: var(--slider-height);
		left: var(--r);
		top: 2px;
		display: flex;
		align-items: center;
		justify-content: space-around;
		z-index: 1;
		pointer-events: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}

	#topn-slider {
		display: flex;
		align-items: center;
	}

	input[type='range'] {
		width: var(--slider-width);
		height: var(--slider-height);
		background-color: var(--color-theme-darkgrey2);
		border-radius: var(--slider-height);
		z-index: 0;
		outline: none;
		appearance: none;
		-webkit-appearance: none;
	}

	input[type='range']::-webkit-slider-thumb {
		width: var(--thumb-width);
		height: var(--thumb-height);
		background-color: rgba(var(--color-range-20), 0.6);
		color: rgba(var(--color-range-20), 0.6);
		border-radius: var(--thumb-height);
		cursor: pointer;
		position: relative;
		z-index: 2;
		appearance: none;
		-webkit-appearance: none;
	}

	input[type='range']::-moz-range-thumb {
		width: var(--thumb-width);
		height: var(--thumb-height);
		background-color: var(--color-theme-yellow);
		border-radius: var(--thumb-height);
		cursor: pointer;
		position: relative;
		z-index: 2;
	}
</style>
