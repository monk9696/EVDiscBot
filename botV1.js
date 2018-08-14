//Discord lib
const Discord = require('discord.js');

//Config for specific constants that are user based
const config = require("./auth.json");

//Filesystem to store relevant data to the proper files
const fs = require("./filewrite.js");
const file = new fs();

//Instantiates the bot
const bot = new Discord.Client();
var botChan;
var anonChan;


var tempMess = config.roleMessage
//parse the Warframe Data
const fetch = require('node-fetch')
var cetus = [false,""];
var alert = [];
var fissure = [];
var baro = false;
var news = [];
// storage variables for the data that gets stored
var neededWeapons = [];
var weaponList = new Map();

//current universal role declaration to define the user as admin
var role = false;

var botGuild;
var botRole;

//What the bot does on startup
bot.on("ready", () => {
	
	//sets up the main guild for the bot
	botGuild = bot.guilds.find('name', config.mainGuild);
	//declares a main testing role
	botRole = getRole(config.botRoleMess[0]);
	

	//Seting the playing text for the bot
	bot.user.setActivity("Sacrificing Goats");
	//Reads in the files into variables (going to set up proper jsons and includes later)
	file.readFile(weaponList, neededWeapons);
	
	//Defines text-channels for certain bot outputs
	//botchannel
	botChan = botGuild.channels.find("name",config.channel[0]);
	//announcements
	anonChan = botGuild.channels.find("name",config.channel[1]);
	

	//automated alert that checks warfarme api in miliseconds 1000 = 1 second
	setInterval(warGet, 60000);


	//set up for the auto role selection
	tempMess = roleSet(tempMess);
});

//when a message is sent in any channel it is apart of this line will execute
bot.on('message', (message) =>{
	
	//ignores other bots messages
	if(message.author.bot){
		return;
	}

	//separate the initial term
	var litteral = message.content;
	//ignores all non commands inputs
	if(litteral.indexOf(config.prefix) !== 0){
		return;
	}

	//checks to make sure the message is in the desired channel
	if(message.channel != botChan){
		message.reply("Wrong channel, please use the __**" + config.channel[0] + "**__ channel for bot commands");
		return;
	}
	//checks the role for admin status per message basis
	if(message.member.roles.some(r=>config.botRoleAdmin.includes(r.name)))	{
		role = true;
	}else{
		role = false;
	}

	//separates the arguments
	litteral = litteral.slice(1);
	var args = litteral.split(" ");
	litteral = args[0];
	args.shift();

	//Switch statement fo handling all cases based off the first term
	switch(litteral){
		case "help"://help command for explaining what a comand does
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
		case "ping"://simple command to check if the bot is running
			message.channel.send('pong');
			break;
		case "role"://command to check if the user has an admin role
			message.reply("your role value is " + role);
			break;
		case "roleFix":
			message.delete();
			tempMess.then(l=>{
				var array = l.reactions.array();
					console.log(array);
					for(var i = 0; i < array.size; i++){
						var emo = array[i].emoji.name;
						var pepes = array[i].users.array();
						for(var j = 0; j < pepes.size; j++){
							switch(emo){
								case "😀" :
									
									break;

								default:
									pepes[i].createDM().then(l=>{
										l.send(emo + " is not a suggested reaction and has no link please avoid this in the future");
									})
							}
						}
					}
				});
				
				break;
		case "roll"://rolls a die default 6 or based off input
			if(args[0])
				message.reply("You rolled a " + (Math.floor(Math.random() * args[0]) + 1));
			else
				message.reply("You rolled a " + (Math.floor(Math.random() * 6) + 1));
			break;
		case "add"://allows adding a weapon build to the list of weapons requires admin status
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
		case "list"://list the weapons currently with a build in the system
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
		case "edit"://allows editing of the desctiption of a weapon build requires admin status
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
		case "delete"://allow deletion of a build requires admin status
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
		case "get"://allows retrival of multiple builds from the system
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
		case "request"://adds to a list of requested weapons builds by your community
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
		case "get_request"://returns the list of requested builds
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
		case "clear_request"://allows removal of the request list or to clear the whole list requires admin status
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
		default: //default responce when no command path is reached
			message.reply(litteral + " is not a valid command check your spelling");
			break;
	}
});

//Should reconect the bot if it momentarily disconnects from the server 
bot.on("error", (e) => console.error(e));
bot.on("warn", (e) => console.warn(e));
//bot.on("debug", (e) => console.info(e));

//Command will log the bot in upon start up
bot.login(config.token);


//Function to load in the data from the Warframe API
async function warGet(){
	//console.log("WarGet");
	fetch("https://ws.warframestat.us/pc")
		.then((resp) => resp.json())
			.then(function(data){
				//WGCetus(data);
				//WGAlert(data);
				//WGFissure(data);
				//WGBaro(data);
				//WGNews(data);
			})
}

//This handles the request for cetus time changes
function WGCetus(data){
	var temp = cetus[0];
	cetus[0] = data.cetusCycle.isDay;
	cetus[1] = data.cetusCycle.shortString;
	if(temp != cetus[0]){
		if(cetus[0] == true){
			botChan.send("Cetus has returned to day and the Eidolons have gone back into hiding");
		}else{
			botChan.send("Night has befallen Cetus and the Eidolons have been agitated and must be stoped");
		}
	}
}

//This handles the creation and posting of embeds for new alerts
function WGAlert(data){
	var tempAler = [];
	var aler = false;
	var embed = new Discord.RichEmbed();
	embed.setTitle("New alerts have been activated")
	embed.setColor(0xff0000);
	for(var i = 0; i < data.alerts.length; i++){
		var tempNode = data.alerts[i];	
		if(alert.indexOf(tempNode.id) == -1){
			aler = true;
			tempAler.push(tempNode.id);
			embed.addField(tempNode.mission.node,
				"Mission Type: " + tempNode.mission.type + 
				"\nEnemy Faction: " + tempNode.mission.faction + 
				"\nAlert Reward: " + tempNode.mission.reward.asString + 
				"\nRemaining Time: " + tempNode.eta + 
				"\nEnemy Level Range: " + tempNode.mission.minEnemyLevel + 
				"-" + tempNode.mission.maxEnemyLevel +
				"\nNightmare Mission: " + tempNode.mission.nightmare +
				"\nArchwing: " + tempNode.mission.archwingRequired
				
			);
		}else{
			tempAler.push(tempNode.id);
		}
	}if(aler == true){
		botChan.send(getRole(config.botRoleMess[3]) + "");
		botChan.send(embed);
	}
	alert = tempAler.slice();
}

//This handles the creation of embeds for new fissures
function WGFissure(data){
	var tempFis = [];
	var fis = false;
	
	for(var i = 0; i < data.fissures.length; i++){
		var tempNode = data.fissures[i];
		if(fissure.indexOf(tempNode.id) == -1){
			fis = true;
			tempFis.push(tempNode.id);
			embed.addField( tempNode.node,
						"Mission Type: " + tempNode.missionType + 
						"\nEnemy Faction: " + tempNode.enemy + 
						"\nFissure Teir: " + tempNode.tier + 
						"\nTime Until Collapse: " + tempNode.eta);

		}else{
			tempFis.push(tempNode.id);
		}
	}if(fis == true){
		botChan.send(getRole(config.botRoleMess[2]) + "");
		botChan.send(embed);
	}
	fissure = tempFis.slice();
}

//This Handles notification and listing of Baro Ki'teer and his inventory
function WGBaro(data){
	if(baro == false){
		if(data.voidTrader.active == true){
			baro = true;
			const embed = new Discord.RichEmbed();
			embed.setTitle("Baro Ki'teer's inventory");
			embed.setColor(0x63738c);
			var baroInv = data.voidTrader.inventory;
			for(var i = 0; i < baroInv.length; i++){
				embed.addField(baroInv[i].item, "Ducuts: " + baroInv[i].ducats + 
					" Credits: " + baroInv[i].credits);
			}
			anonChan.send("@everyone Heyoo Brother Tenno, \nBaro Ki'tter is Here.");
			anonChan.send(embed);
			//console.log(baroInv);
		
		}else{
			if(data.voidTrader.active == false){
				baro = false;
			}
		}
	}
}

//Handles Notificatons for News hot off the press from Warframe
function WGNews(data){
	var tempNews = [];
	for(var i = 0; i < data.news.length; i++){
		var tempNode = data.news[i];
		if(news.indexOf(tempNode.id) == -1){
			tempNews.push(tempNode.id);
			if(tempNode.update == true || tempNode.primeAccess == true){
				anonChan.send("@everyone " + tempNode.message +
					"\nFourm Link: " + tempNode.link);
			}else{
				if(tempNode.translations.en != null){

					botChan.send(getRole(config.botRoleMess[1]) + "" + tempNode.message +
						"\nFourm Link: " + tempNode.link);
				}
			}
		}else{
			tempNews.push(tempNode.id);
		}
	}
	news = tempNews.slice();	
}

function getRole(string){
	return (botGuild.roles.find('name', string));
}

function roleSet(message){
	if(message == null){
		botChan.send("this is a new message");
		message = botChan.fetchMessages({limit: 1})
			.then(function(value){
				console.log(value.first().id);
				return value.first()
			});
		message.then(l=> {
			l.edit('React with a 🌕 to gain or lose the Fissure role\n\nReact with 😀 to gain or lose the Alert role\n\nWhen you are ready send !roleFix in ' + config.channel[1]);
		});
	}else{
		message = botChan.fetchMessage(message)
			.then(value => {
				console.log(value.first().id);
				return value.first();
			})
	}
	message.then(message => {
		message.react('🌕');
		message.react('😀');
	});

	return message;
}