
import type { AttributeLabels, WeightedNode } from './tree-types'

export type SpecInfo = { nodeRate: number, baselineRate: number, specMetric: number };
export const ALPHA = 0.2

export function getSpecMetricObject(
    node: WeightedNode,
    nodeDivisor: number,
    entityNumCount: number,
    entityKind: string,
    attributeLabels: AttributeLabels,
    childId: string,
    resolver_description: string
): SpecInfo {

    const nodeRate = (node?.weight || 0) / nodeDivisor
    const baselineRate: number = attributeLabels[entityKind][childId]?.spec_baselines[resolver_description] || (nodeRate * 0.5)
    const normalizerEps = 1 / entityNumCount

    return {
        nodeRate, baselineRate, specMetric: nodeRate / (baselineRate + ALPHA * normalizerEps)
    }
}



