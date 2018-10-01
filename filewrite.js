const Discord = require('discord.js');
const config = require("./auth.json");
const fs = require('fs');

class fileWrite{

	constructor(){
	}

	readWeapFile(list, data){
		let reqBool = false;
		for (let key of Object.keys(data)){
			list[key] = data[key];
			if(key == "request"){
				reqBool = true;
				console.log("Request Existed");	
			}
		}
		if(!reqBool)
		{
			console.log("Request Made");
			list["request"] = [];
		}
		console.log("Weapon File Loaded");	
	}

	weaponOutput(data){
		let output = JSON.stringify(data, null, 2);
		fs.writeFile(config.fileWrite[1], output, (err) => {
			if(err) throw err;
			console.log("weapon saver");
		})
	}

	statOutput(data){
		let output = JSON.stringify(data, null, 2);
		fs.writeFile(config.fileWrite[2], output, (err) => {
			if(err) throw err;
			//console.log("weapon saver");
		})
	}

	writeWGet(data){
		let output = JSON.stringify(data, null, 2);
		fs.writeFile(config.fileWrite[0], output, (err)=> {
			if(err) throw err;
			//console.log("fileSaved");
		});
	}
}

module.exports = fileWrite;