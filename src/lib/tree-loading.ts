import { STORE_URL } from "./constants";
import type { AttributeLabels, QcSpecMap } from "./tree-types";

export function handleStore<T, R>(endPoint: string, fun: (o: T) => R) {
    return fetch(`${STORE_URL}/${endPoint.replace('+', '%2B')}.json.gz`).then((res) => {
        return res.json().then((jsv) => {
            return fun(jsv);
        }).catch(() => {
            console.error(endPoint)
        });
    });
}

export function mainPreload() {
    const arResp = handleStore('attribute-statics', (jsv: AttributeLabels) => {
        return jsv
    });
    const qcSpecResp = handleStore('qc-specs', (qcSpecs: QcSpecMap) => {
        return qcSpecs
    });
    return Promise.all([arResp, qcSpecResp])
}

