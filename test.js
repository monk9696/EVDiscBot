const xkcd = require("./XKCD.js");
const comic = new xkcd();

let x = comic.getKCD().then((x) =>{
	//console.log(x);
	console.log(x[0]);
})