//Discord lib
const Discord = require('discord.js');
//Config speciffic constants
const config = require("./auth.json");
//filesystem
const fs = require("./filewrite.js");
//Instantiates the bot
const bot = new Discord.Client();

//parse the Warframe Data
const fetch = require('node-fetch')

//Saves and stores to a file
const file = new fs();

//const ga = require("./Tempgame.js");
//const game = new ga();

var neededWeapons = [];
var weaponList = new Map();
var role = false;

bot.on("ready", () => {
	bot.user.setActivity("life");
	file.readFile(weaponList, neededWeapons);
	setInterval(warGet, 60000);
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
		/*case "ga":
			game.resourceFix();
			switch(args[0]){
				case "add":
					game.buy(args[1]);
					break;
				default:
					break;
			}
			game.display();
			break;
		*/
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
					message.channel.send("!add [weapon\\_name] [link] [Sustained\\_dps] [Burst\\_dps] [MR] [Status\\_Chance] [description[]], weapon\\_name needs to be one word so replace any spaces with a \\_");
					message.channel.send("Sustained and Burst are the dps Calculations for each, Description is the description for the build may be multiple words")
					break;
				case "get":
					message.channel.send("This command will allow you the get a build for any weapon in our database");
					message.channel.send("!get [weapon_name[]] weapon name must be one word so replace and space with a \\_, you can also request as many weapons as you desire by adding the next weapon to the end !get [weapon1] [weapon2]");
					break;
				case "delete": 
					message.channel.send("This command will allow those with the permission, to delete a build/weapon from the bot for a reason");
					message.channel.send("!delete [weapon\\_name] [number], weapon\\_name needs to be one word so replace any spaces with a \\_, and number is the number by the build when using the !get command");
					message.channel.send("If you want to just delete the weapon, juet ignore the number stipulation")
					break;
				case "edit":
					message.channel.send("This command will allow those with the permission, to edit the description of a weapon for a specific build");
					message.channel.send("!edit [weapon\\_name] [number] [description], see !add for information on [weapon\\_name] and [description], [number] is the number found by the build you want to edit");
					break;
				case "list":
					message.channel.send("This command will list all of the different weapons stored in the database");
					break;
				case "request":
					message.channel.send("This command will allow you to request builds for a weapon that does not exist in the database");
					message.channel.send("!request [weapon_name[]] where the weapon\\_name[] is one word per weapon so replace the space with a \\_ numerous weapons can be requested at one time.");
					break;
				case "get_request":
					message.channel.send("This command will respond with a list of the requested weapons");
					break;
				case "clear_request":
					message.channel.send("This command will clear the list or weapons for requested weapons once they are resolved, the use of this command is restricted to those with a specific role");
					message.channel.send("!clear_request [weapon[]] where weapon[] is a list of the weapons to remove from the list of requested weapons.");					
					break;
				default: 
					message.channel.send("There are numerous commands that can be used, typing !help [command] will give you more info on that command");
					message.channel.send("Commands: ping, role, roll, add, get, edit, delete, list, request, get_request, clear\\_request")
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
			if(args.length < 7){
			message.reply("You need to include the weapon name, link to the build, Sustained and Burst DPS numbers, the weapons MR, and the Status chance and a description");
				break;
			}
			var descrip = "";
			for(var r = 6; r < args.length; r++){
				descrip = descrip + args[r] + " ";
			}
			var stuff = {
				Link: args[1],
				Sustained: args[2],
				Burst: args[3],
				MR: args[4],
				Status: args[5],
				Descrip: descrip
			};
			if(weaponList[args[0]]){
				weaponList[args[0]].push(stuff);
			} else {
				weaponList[args[0]] = [];
				weaponList[args[0]].push(stuff);
			}
			message.channel.send(args[0] + " added to the list");
			file.writeWeapFile(weaponList,message);
			break;
		case "list":
			var list = Object.keys(weaponList);
			if(list.length >= 1){
				var out = "";
				for(var name of list){
					out += name + ", ";
					if(out.length >= 1500){
						message.channel.send(out);
						out = "";
					}
				}
				message.channel.send(out);
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
			file.writeWeapFile(weaponList,message);
			break;
		case "delete":
			if(!role){
				message.reply("You do not have the proper role for this command");
				break;
			}
			if (args[1] == undefined){
				if (weaponList[args[0]]){
					message.channel.send(args[0] + " deleted");
					delete weaponList[args[0]];
					weaponList.delete(args[0]);
				}
			} else if (weaponList[args[0]] && weaponList[args[0]].length >= args[1]){
				if (weaponList[args[0]].length >= 1){
					weaponList[args[0]].splice((args[1] - 1), 1);
				} else {
					delete weaponList[args[0]];
					weaponList.delete(args[0]);
				}
			} else {
				message.reply("Either the weapon does not exist or does not have " + args[1] + " builds");
			}
			file.writeWeapFile(weaponList,message);
			break;
		case "get":
			if (args[0]){
				for (var j = 0; j < args.length; j++){
					if (weaponList[args[j]]){
						if (weaponList[args[j]][0]){
							message.channel.send(args[j] + ": Required MR: " + weaponList[args[j]][0].MR);
							for(var i = 0; i < weaponList[args[j]].length; i++){
								message.channel.send((i+1) + ": " + weaponList[args[j]][i].Descrip + "\nSustained DPS: " + weaponList[args[j]][i].Sustained + ", Burst DPS: " + weaponList[args[j]][i].Burst + ", Status Chance: " + weaponList[args[j]][i].Status + "\n" + weaponList[args[j]][i].Link);
							}
						} else {
							message.reply(args[j] + " does not have a build yet, make sure it is spelled correctly before requesting a build ERROR: Deleted");
						}
					} else {
						message.reply(args[j] + " does not have a build yet, make sure it is spelled correctly before requesting a build");
					}
				}
			} else {
				message.reply("You must list some weapon for this command"); 
			}
			message.channel.send("Done");
			break;
		case "request":
			if(args[0] == undefined){
				message.reply("You need to add a weapon to request");
				break;
			}
			for(var i = 0; i < args.length; i++){
				if(neededWeapons.indexOf(args[i]) == -1){
					neededWeapons.push(args[i]);
					message.channel.send(args[i] + " added to the request list");
				} else {
					message.channel.send(args[i] + " already exists");
				}
			}
			file.writeReqFile(neededWeapons, message);
			break;
		case "get_request":
			if(neededWeapons.length == 0){
				message.channel.send("No requested builds");
				break;
			}
			var out = "";
			for(var name of neededWeapons){
				out += name + ", ";
				console.log(out.length);
				if(out.length >= 1500){
					message.channel.send(out);
					out = "";
				}
			}
			if(out !== ""){
				message.channel.send(out);
			}
			break;
		case "clear_request":
			if(!role){
				message.reply("You do not have the proper role for this command");
				break;
			}
			if(!args[0]){
				delete neededWeapons;
				neededWeapons = [];
				message.reply("Requests have been cleared");
				file.writeReqFile(neededWeapons, message);
				break;
			}
			for(var i of args){
				var loc = neededWeapons.indexOf(i)
				if(loc > -1){
					message.channel.send(i + " removed");
					neededWeapons.splice(loc,1);
				}
			}
			file.writeReqFile(neededWeapons, message);
			break;
		default:
			message.reply(litteral + " is not a valid command check your spelling");
			break;
	}
});

bot.on('disconnected', function(){
	bot.login(config.token);
});

bot.login(config.token);


async function warGet(){
	console.log("WarGet");
	fetch("https://ws.warframestat.us/pc")
		.then((resp) => resp.json())
			.then(function(data){
				console.log(data.alerts);
			})
}