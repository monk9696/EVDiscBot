const Discord = require('discord.js');
const config = require("./auth.json");
const fs = require('fs');

class fileWrite{

	constructor(){
	}

	writeWeapFile(list,message){
		const stream = fs.createWriteStream(config.fileWrite[0]);
		stream.once('open', () => {
			var outputKeys = Object.keys(list);
			for(var key of outputKeys){
				if (list[key][0]){
					for(var i = 0; i < list[key].length; i++){
						stream.write(key + " " + list[key][i].Link + " " + list[key][i].Sustained + " " + list[key][i].Burst + " " + list[key][i].MR + " " + list[key][i].Status + " " + list[key][i].Descrip + '¯\\_(ツ)_/¯\n');
					}
				}
			}
			stream.end();
		});
		message.reply("Wrote");
		console.log("The file was saved!");
	}

	readWeapFile(list){
		var readIN = "";
		fs.readFile(config.fileWrite[0] , 'utf8', (err, readIN) => {
			if(err){
				message.reply("Read failed");
				throw err;
				return;
			}
			console.log(readIN);
			var data = readIN.split("¯\\_(ツ)_/¯");
			for(var i = 0; i < (data.length - 1); i++){
				if(data[i][0] == "\n"){
					data[i] = data[i].slice(1);
				}
				console.log(data[i] + " " + i);
				var weapCheck = data[i].split(" ");
				var weapAdd = {
					Link: weapCheck[1],
					Sustained: weapCheck[2],
					Burst: weapCheck[3],
					MR: weapCheck[4],
					Status: weapCheck[5],
					Descrip: weapCheck[6]
				};
				for(var j = 7; j < weapCheck.length; j++){
					weapAdd.Descrip =  weapAdd.Descrip + " " + weapCheck[j];
				}
				if (!list[weapCheck[0]]){
					list[weapCheck[0]] = [];
					list[weapCheck[0]].push(weapAdd);
				}else{
					list[weapCheck[0]].push(weapAdd);
				}
				console.log(weapCheck[0] + " Added");
			}
		});
	}

	writeReqFile(list,message){
		const stream = fs.createWriteStream(config.fileWrite[1]);
		stream.once('open', () => {
			for(var i = 0; i < list.length; i++){
				stream.write(list[i] + "¯\\_(ツ)_/¯\n");
			}
			stream.end();
		});
		message.channel.send("Request list updated");
	}

	readReqFile(list){
		var readIN = "";
		fs.readFile(config.fileWrite[1] , 'utf8', (err, readIN) => {
			if(err){
				message.reply("Read failed");
				throw err;
				return;
			}
			console.log(readIN);
			var data = readIN.split("¯\\_(ツ)_/¯\n");
			for(var i = 0; i < (data.length - 1); i++){
				if(data[i][0] == "\n"){
					data[i] = data[i].slice(1);
				}
				console.log(data[i] + " " + i);
				if (!list){
					list = [];
					list.push(data[i]);
				}else{
					list.push(data[i]);
				}
				console.log(data[i] + " Added");
			}
		});
	}

	writeWGet(data){
		let output = JSON.stringify(data, null, 2);
		fs.writeFile(config.fileWrite[2], output, (err)=> {
			if(err) throw err;
			console.log("fileSaved");
		});
	}

	readFile(weap, req){
		var readIN = "";
		fs.readFile(config.fileWrite[0] , 'utf8', (err, readIN) => {
			if(err){
				message.reply("Read failed");
				throw err;
				return;
			}
			console.log(readIN);
			var data = readIN.split("¯\\_(ツ)_/¯");
			for(var i = 0; i < (data.length - 1); i++){
				if(data[i][0] == "\n"){
					data[i] = data[i].slice(1);
				}
				console.log(data[i] + " " + i);
				var weapCheck = data[i].split(" ");
				var weapAdd = {
					Link: weapCheck[1],
					Sustained: weapCheck[2],
					Burst: weapCheck[3],
					MR: weapCheck[4],
					Status: weapCheck[5],
					Descrip: weapCheck[6]
				};
				for(var j = 7; j < weapCheck.length; j++){
					weapAdd.Descrip =  weapAdd.Descrip + " " + weapCheck[j];
				}
				if (!weap[weapCheck[0]]){
					weap[weapCheck[0]] = [];
					weap[weapCheck[0]].push(weapAdd);
				}else{
					weap[weapCheck[0]].push(weapAdd);
				}
				console.log(weapCheck[0] + " Added");
			}
		});


		//req file

		readIN = "";
		fs.readFile(config.fileWrite[1] , 'utf8', (err, readIN) => {
			if(err){
				message.reply("Read failed");
				throw err;
				return;
			}
			console.log(readIN);
			var data = readIN.split("¯\\_(ツ)_/¯\n");
			for(var i = 0; i < (data.length - 1); i++){
				if(data[i][0] == "\n"){
					data[i] = data[i].slice(1);
				}
				console.log(data[i] + " " + i);
				if (!req){
					req = [];
					req.push(data[i]);
				}else{
					req.push(data[i]);
				}
				console.log(data[i] + " Added");
			}
		});
	}

}

module.exports = fileWrite;