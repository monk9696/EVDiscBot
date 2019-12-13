const xkcd = require("./XKCD.js");
const comic = new xkcd();

const fetch = require('node-fetch');
const WorldState = require('warframe-worldstate-parser');

const fs = require("./filewrite.js");
const file = new fs();

let load = "";

/*
let x = comic.getKCD().then((x) =>{
	//console.log(x);
	console.log(x);
})
*/
test();

setInterval(loading, 5000);

async function test(){
	
	fetch("http://content.warframe.com/dynamic/worldState.php")
		.catch(e=> console.log(e))
		.then((body) => body.text())
		.then((data) => {

			let ws = new WorldState(data);

		//	console.log(JSON.parse(data));
/*
			WGNews(ws.news);
			WGCetus(ws.cetusCycle);
			WGAlert(ws.alerts);
			WGFissure(ws.fissures);
			WGSortie(ws.sortie);
			WGNightWave(ws.nightwave);
			WGBaro(ws.voidTrader);
			WGInvasion(ws.invasions);
*/
			//earth valis, constructionproggress
			//invasion daily deal simmaris
			
			file.output(ws,"WGPropperOut.json");
		}).catch((e) => {
			console.log(e);
		}).then(checck => {/*file.output(wGetLog,config.fileWrite[1]);*/});
}



function loading(){
	
	console.log("Loading." + load);
	if(load === "....."){
		load = "";
	}else{
		load += ".";
	}
}
