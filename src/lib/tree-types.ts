import type { EntityType, GLOBAL_BASE_TYPE } from "./constants";

export type OMap<T> = Record<string, T>;
export type PathInTree = string[];
export type TreeGen<T> = T & { children?: OMap<TreeGen<T>> };

export type SelectionOption = {
    name: string;
    id: string;
    meta?: string;
};

export type QcSpec = {
    title: string;
    description: string;
    root_entity_type: string;
    bifurcations: Bifurcation[];
};

export type Bifurcation = {
    attribute_kind: EntityType;
    resolver_id: string;
    control_format_str: string;
    description: string;
};


export type QcSpecMap = OMap<QcSpec>;

type AlGen<T> = { name: string; meta: T };

export type AttributeLabelsRaw = OMap<OMap<AlGen<string>>>;
export type AttributeLabel = AlGen<OMap<number | object>>;
export type AttributeLabels = OMap<OMap<AttributeLabel>>;


export type BareNode = TreeGen<object>;
export type WeightedNode = TreeGen<{ weight: number }>;
export type NamedNode = TreeGen<{ weight: number; name: string }>;
export type EmbeddedNode = TreeGen<{
    weight: number,
    name: string,
    totalOffsetOnLevel: OffsetInfo
    childrenSumWeight: number;
    totalOffsetAmongSiblings: OffsetInfo;
    isSelected: boolean;
    scaleEnds: { min: number; max: number; mid: number };
    specMetric: { rawMetric: number; normalizedMetric: number };
}>;


export type OffsetInfo = { rank: number; weight: number };

export type InteractionKind = 'toggle-select' | 'highlight' | 'de-highlight';
type SizeBaseKind = 'volume' | 'specialization';

export type TreeInteractionEvent = { path: PathInTree; action: InteractionKind, topLeftCorner: { x: number, y: number } };


export type DerivedLevelInfo = { totalWeight: number; totalNodes: number };

export type TreeInfo = { tree: EmbeddedNode; meta: DerivedLevelInfo[] };
export type ControlSpec = { exclude: string[]; include: string[]; limit_n: number; show_top: boolean; size_base: SizeBaseKind };

export type BreakdownOptions = OMap<{ children: BreakdownOptions, qcSpecs: string[] }>;
export type SelectedBreakdowns = string[];
export type LevelOutSpec = { totalSize: number; topOffset: number, isVisible: boolean, levelOptions: string[] };


export type SpecializationBasis = { basis: EntityType | typeof GLOBAL_BASE_TYPE; hierarchy: EntityType | typeof GLOBAL_BASE_TYPE };
export type SomeSpecBaselineMap = OMap<OMap<OMap<number> | number> | number>;
export type SpecBaseOptions = OMap<SomeSpecBaselineMap>;
