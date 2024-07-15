import { insertKeepingOrder } from "./tree-functions";
import unidecode from 'unidecode';
import type { OMap, SelectionOption } from "./tree-types";

export function getTopFzf(term: string, entities: OMap<{ name: string }>, limit: number, emptyShow = false) {
    const out: { name: string; id: string }[] = [];
    if ((term.length == 0) && !emptyShow) {
        return out;
    }
    const lowTerms = term.split(' ').map((e) => e.toLowerCase());
    for (const [elemId, e] of Object.entries(entities)) {
        const eLow = unidecode(e.name).toLowerCase()
        if (lowTerms.map((t) => eLow.includes(t)).reduce((l, r) => l && r)) {
            out.push({ name: e.name, id: elemId });
            if (out.length >= limit) {
                return out;
            }
        }
    }
    return out;
}


export function getTopFzfRoot(term: string, entities: SelectionOption[], limit: number) {
    //
    const out: { name: string, id: string, semanticId: string, rootType: string, papers: number, citations: number }[] = [];
    const lowTerms = unidecode(term).split(' ').map((e) => e.toLowerCase());
    for (const { id, name, meta, rootType } of entities) {
        
        const eLow = unidecode(name).toLowerCase()
        if (lowTerms.map((t) => eLow.includes(t)).reduce((l, r) => l && r)) {
            const semanticId = meta?.semantic_id;
            if (semanticId == undefined) {
                continue
            }
            const papers = parseInt(meta?.papers || '0');
            const citations = parseInt(meta?.citations || '0');
            const newEntry = { name, id, papers, citations, semanticId, rootType }
            if ((out.length < limit) || (out[out.length - 1].citations < newEntry.citations)) {
                (out.length >= limit) && out.pop();
                insertKeepingOrder(newEntry, out, (l, r) => r.citations - l.citations);

            }
        }
    }
    return out
}
