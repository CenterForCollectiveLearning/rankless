<script lang="ts">
	import { onMount } from 'svelte';

	export let speed = 150;
	export let stopAtEnd = 300;
	export let texts = ['one', 'two', 'hundred'];
	export let wordInd = 0;

	let text = '';

	let runner: number;

	onMount(() => {
		runner = setInterval(changeText, speed);
	});
	let letterInd = 0;
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
</script>

{text}
