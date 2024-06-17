import rootList from '$lib/assets/data/roots.json';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
    return rootList
}
export const prerender = true;
export const trailingSlash = 'never';
