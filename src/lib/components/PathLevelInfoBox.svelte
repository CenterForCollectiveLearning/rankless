<script lang="ts">
	import type {AttributeLabels, PathInTree, QcSpec, WeightedNode} from '$lib/tree-types';
	import {formatNumber} from '$lib/text-format-util';
	import {getSpecMetricObject, type SpecInfo} from '$lib/metric-calculation';

	export let rootId: string;
	export let path: PathInTree;
	export let qcSpec: QcSpec;
	export let attributeLabels: AttributeLabels;
	export let weightedRoot: WeightedNode;

	function getNodes(
		path: PathInTree,
		weightedRoot: WeightedNode
	): {name: string; weight: number; spec: SpecInfo}[] {
		if (qcSpec?.root_entity_type === undefined) {
			return [];
		}
		const nodes = [
			{
				weight: weightedRoot.weight,
				name: attributeLabels[qcSpec.root_entity_type][rootId].name,
				spec: {nodeRate: 0, specMetric: 0, baselineRate: 0}
			}
		];
		let divisorWeight = weightedRoot.weight;
		let divisorResolver = qcSpec.bifurcations[0].resolver_id;
		let currentNode = weightedRoot;
		for (let i = 0; i < path.length; i++) {
			const childId = path[i];
			const bif = qcSpec.bifurcations[i];
			const nextBif = qcSpec.bifurcations[i + 1];
			const entityKind = bif.attribute_kind;
			const entityN = Object.keys(attributeLabels[entityKind]).length;
			currentNode = currentNode.children[childId] || {weight: 0, children: {}};
			nodes.push({
				name: attributeLabels[entityKind][childId]?.name || 'Unknown',
				weight: currentNode.weight,
				spec: getSpecMetricObject(
					currentNode,
					divisorWeight,
					entityN,
					entityKind,
					attributeLabels,
					childId,
					bif.description
				)
			});
			if (nextBif?.resolver_id != divisorResolver) {
				divisorResolver = nextBif?.resolver_id;
				divisorWeight = currentNode.weight;
			}
		}
		return nodes;
	}

	function getDesc(rate: number) {
		let desc = 'Average';
		if (rate > 2.5) {
			desc = 'Very High';
		} else if (rate > 1.2) {
			desc = 'High';
		} else if (rate < 0.75) {
			desc = 'Low';
		}
		return desc;
	}

	let hoverSpec = false;

	$: pathNodes = getNodes(path || [], weightedRoot);
	$: leaf = pathNodes[pathNodes.length - 1];
</script>

{#if path != undefined}
<div class="box-container">
	<h2>{leaf.name}</h2>
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<p on:mouseover={()=> {
		hoverSpec = false;
		}}
		on:mouseleave={() => {
		hoverSpec = false;
		}}
		>
		{getDesc(leaf.spec.specMetric)} Specialization
	</p>
	{#if hoverSpec}
	<span id="spec-hover">
		metric = {formatNumber(leaf.spec.specMetric, 3)}; base = {leaf.spec.baselineRate}; nodeRate
		= {leaf.spec.nodeRate}; childN={leaf.weight}
	</span>
	{/if}
	<p>
		{formatNumber(leaf.weight, 0)} ({(leaf.spec.nodeRate * 100).toFixed(2)}%) citation{#if leaf.weight >
		1}s{/if}
	</p>
</div>
{/if}

<style>
	h2 {
		text-align: center;
		padding: 15px;
		font-size: min(1.1rem, 2vw);
	}

	h2 {
		margin: 0px;
		text-align: center;
	}

	p {
		text-align: center;
		font-size: min(1rem, 2vw);
	}

	p {
		padding-left: 20px;
	}

	.box-container {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		height: 100%;
	}

	#spec-hover {
		position: absolute;
		top: 0px;
		left: 0px;
		padding: 15px;
		background-color: var(--color-theme-lightgrey);
	}
</style>
