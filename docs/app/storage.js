const KEY="ley29090_mvp_state_v3";
export function loadState(){try{const r=localStorage.getItem(KEY);return r?JSON.parse(r):null;}catch{return null;}}
export function saveState(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}}
