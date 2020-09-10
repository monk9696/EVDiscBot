const xkcd = require("./XKCD.js");
const comic = new xkcd();

const fetch = require('node-fetch');


const fs = require("./filewrite.js");
const file = new fs();

let load = "";


test(null, new Date().getUTCDate());

//setInterval(loading, 5000);

async function test(timestamp, currDate){
	console.log(currDate);

	if(timestamp.getUTCHours == 0 && timestamp.getUTCDate != currDate){
		currDate = timestamp.getUTCDate;
		console.log("daily Reset");
	}
}




function loading(){
	
	console.log("Loading." + load);
	if(load === "....."){
		load = "";
	}else{
		load += ".";
	}
}
