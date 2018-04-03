//Discord lib
const Discord = require('discord.js');
//Config speciffic constants
const config = require("./auth.json");
//filesystem
const fs = require('fs');
//Instantiates the bot
const bot = new Discord.Client();

var neededWeapons = [];
var weaponList = new Map();
var role = false;

bot.on("ready", () => {
	bot.user.setActivity("life");
	readJSONFile(weaponList);
});


bot.on('message', (message) =>{
	//ignores other bots
	if(message.author.bot){
		return;
	}
	//checks to make sure the message is in a desired channel
	if(message.channel.name != config.channel){
		return;
	}
	//checks the role for a moderator status
	if(message.member.roles.some(r=>config.botRole.includes(r.name)))	{
		role = true;
	}else{
		role = false;
	}
	var litteral = message.content;
	//ignores all non commands
	if(litteral.indexOf(config.prefix) !== 0){
		return;
	}
	//separates the arguments
	litteral = litteral.slice(1);
	var args = litteral.split(" ");
	litteral = args[0];
	args.shift();
	switch(litteral){
		case "help":
			switch(args[0]){
				case "help":
					message.channel.send("Your usage of this command was very stupid @everyone come and laugh at <@" + message.member.id + ">");
					break;
				case "ping":
					message.channel.send("This is a simple command to check if the bot is truely working as intended");
					break;
				case "role":
					message.channel.send("This Command states if your current role has access to all viable commands");
					break;
				case "roll":
					message.channel.send("This command can be used to roll a dice of a specified size, !roll [number] if you leave number empty it will default to 6");
					break;
				case "add":
					message.channel.send("This command will allow people with the proper role to add a build to the list of avilable builds");
					message.channel.send("!add [weapon\\_name] [link] [Sustained\\_dps] [Burst\\_dps] [description[]], weapon\\_name needs to be one word so replace any spaces with a \\_");
					message.channel.send("Sustained and Burst are the dps Calculations for each, Description is the description for the build may be multiple words")
					break;
				case "get":
					message.channel.send("This command will allow you the get a build for any weapon in our database");
					message.channel.send("!get [weapon_name[]] weapon name must be one word so replace and space with a \\_, you can also request as many weapons as you desire by adding the next weapon to the end !get [weapon1] [weapon2]");
					break;
				/*case "delete": 
					message.channel.send("This command will allow those with the permission, to delete a build from the bot for a reason");
					message.channel.send("!delete [weapon\\_name] [number], weapon\\_name needs to be one word so replace any spaces with a \\_, and number is the number by the build when using the !get command");
			*/	case "edit":
					message.channel.send("This command will allow those with the permission, to edit the description of a weapon for a specific build");
					message.channel.send("!edit [weapon\\_name] [number] [description], see !add for information on [weapon\\_name] and [description], [number] is the number found by the build you want to edit");
				case "list":
					message.channel.send("This command will list all of the different weapons stored in the database");
					break;
				case "request":
					message.channel.send("This command will allow you to request builds for a weapon that does not exist in the database");
					message.channel.send("!request [weapon_name] where the weapon name is one word so replace the space with a \\_");
					break;
				case "get_request":
					message.channel.send("This command will respond with a list of the requested weapons");
					break;
				case "clear_request":
					message.channel.send("This command will clear the list for requested weapons once they are resolved, the use of this command is restricted to those with a specific role");
					break;
				default: 
					message.channel.send("There are numerous commands that can be used, typing !help [command] will give you more info on that command");
					message.channel.send("Commands: ping, role, roll, add, get, edit, list, request, get_request, clear\\_request")
					break;
			}
			break;
		case "ping":
			message.channel.send('pong');
			break;
		case "role":
			message.reply("your role value is " + role);
			break;
		case "roll":
			if(args[0])
				message.reply("You rolled a " + (Math.floor(Math.random() * args[0]) + 1));
			else
				message.reply("You rolled a " + (Math.floor(Math.random() * 6) + 1));
			break;
		case "add":
			if(!role){
				message.reply("You do not have the proper role for this command");
				break;
			}
			if(args.length < 5){
			message.reply("You need to include the weapon name, link to the build, Sustained and Burst DPS numbers, and a description");
				break;
			}
			var descrip = "";
			for(var r = 4; r < args.length; r++){
				descrip = descrip + args[r] + " ";
			}
			var stuff = {
				Link: args[1],
				Sustained: args[2],
				Burst: args[3],
				Descrip: descrip
			};
			if(weaponList[args[0]]){
				weaponList[args[0]].push(stuff);
			} else {
				weaponList[args[0]] = [];
				weaponList[args[0]].push(stuff);
			}
			message.channel.send(args[0] + " added to the list");
			writeFile(weaponList,message);
			break;
		case "list":
			var list = Object.keys(weaponList);
			if(list){
				message.channel.send(list);
			} else {
				message.reply("No stored Weapons");
			}
			break;
		case "edit":
			if(!role){
				message.reply("You do not have the proper role for this command");
				break;
			}
			if(!args[2])
			{
				message.channel.send("You are missing parameters, please see !help for information")
				break;
			}
			if(!weaponList[args[0]]){
				message.reply(args[0] + " does not exist in the database");
				break;
			}

			var description = "";
			for(var i = 2; i < args.length; i++){
				description += args[i] + " ";
			}
			weaponList[args[0]][(args[1]-1)].Descrip = description;
			writeFile(weaponList,message);
			break;/*
		case "delete":
			if(!role){
				message.reply("You do not have the proper role for this command");
				break;
			}
			if (args[1] == 1 && !(weaponList[args[0]][1])){
				console.log(weaponList.delete(args[0]));
			}else if(!args[1]){
				console.log(weaponList.delete(args[0]));
			}else{
				weaponList[args[0]].splice((args[1]-1),1);
			}
			if(!weaponList[args[0]])
			{
				delete weaponList[args[0]];
				console.log(weaponList.has(args[0]));
			}
			if(weaponList.has(args[0])){
				console.log("Exists");
			}
			writeFile(weaponList,message);
			break;*/
		case "get":
			for (var j = 0; j < args.length; j++){
				if (weaponList[args[j]]){
					message.channel.send(args[j]);
					for(var i = 0; i < weaponList[args[j]].length; i++){
						message.channel.send((i+1) + ": " + weaponList[args[j]][i].Descrip + "\nSustained DPS: " + weaponList[args[j]][i].Sustained + " Burst DPS: " + weaponList[args[j]][i].Burst + "\n" + weaponList[args[j]][i].Link);
					}
				} else {
					message.reply(args[j] + " does not have a build yet, make sure it is spelled correctly before requesting a build");
				}
			}
			message.channel.send("Done");
			break;
		case "request":
			if(args[0] == undefined){
				message.reply("You need to add a weapon to request");
				break;
			}
			for(var i = 0; i < args.length; i++){
				neededWeapons.push(args[i]);
				message.channel.send(args[i] + " added to the request list");
			}
			break;
		case "get_request":
			if(neededWeapons.length == 0 || neededWeapons.length == null){
				message.channel.send("No requested builds");
				break;
			}
			for(var i = 0; i < neededWeapons.length; i++){
				message.channel.send(neededWeapons[i]);
			}
			break;
		case "clear_request":
			if(!role){
				message.reply("You do not have the proper role for this command");
				break;
			}
			delete neededWeapons;
			neededWeapons = [];
			message.reply("Requests have been cleared");
			break;
		default:
			message.reply(litteral + " is not a valid command check your spelling");
			break;
	}
});

bot.login(config.token);

function writeFile(list,message)
{
	const stream = fs.createWriteStream(config.fileWrite);
	stream.once('open', () => {
		var outputKeys = Object.keys(list);
		for(var key of outputKeys){
			for(var i = 0; i < list[key].length; i++){
				stream.write(key + " " + list[key][i].Link + " " + list[key][i].Sustained + " " + list[key][i].Burst + " " + list[key][i].Descrip + '¯\\_(ツ)_/¯\n');
			}
		}
		stream.end();
	});
	message.reply("Wrote");
	console.log("The file was saved!");
}

function readJSONFile(list)
{
	var readIN = "";
	fs.readFile(config.fileWrite , 'utf8', (err, readIN) => {
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
				Descrip: weapCheck[4]
			};
			for(var j = 5; j < weapCheck.length; j++){
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

function clearList(list)
{
	list = [];
}