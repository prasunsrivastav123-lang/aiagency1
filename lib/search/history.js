const KEY = "agency-search-history";

export function getHistory() {

return JSON.parse(

localStorage.getItem(KEY) || "[]"

);

}

export function saveHistory(text){

const arr = getHistory()

.filter(i=>i!==text);

arr.unshift(text);

localStorage.setItem(

KEY,

JSON.stringify(arr.slice(0,8))

);

}