//Discord lib
const Discord = require('discord.js');

//Config for specific constants that are user based
let config = require("./auth.json");
const weap = require("./weap.json");
let wGetLog = require("./WGet.json");

//Filesystem to store relevant data to the proper files
const fs = require("./filewrite.js");
const file = new fs();

//Instantiates the bot
const bot = new Discord.Client();

//bot Channels
let botChan;
let anonChan;
let noteChan;
let permChan;


//admin role so bot can dm when there is an issue or missing exception
let adm;
//Fissure alert Statistic collection
let stat = require("./stat.json");
//define stat if empty
if(stat.alert == null){
	stat = {
		alert:[],
		fiss:[],
		news:[],
	};
}


//Defines the message for the role selection
let roleMess = config.roleMessage;

//parse the Warframe Data
const fetch = require('node-fetch')
let cetus = [null,""];
let baro = false;

// storage variables for the data that gets stored
let weaponList = new Map();

//current universal role declaration to define the user as admin
let role = false;

//predefined variables for identifying the current guild
let botGuild;

//What the bot does on startup
bot.on("ready", () => {
	//sets up the main guild for the bot
	botGuild = bot.guilds.find('name', config.mainGuild);
	
	//declares a main testing role ie dm target
	botGuild.members.array().forEach(x=>{
		//console.log(x.user.id);
		if(x.user.id == config.botAdmin){
			adm = x.user;
		}
	});

	//Seting the playing text for the bot
	bot.user.setActivity(config.playingMessage);
	//#remove
	//Reads in the files into variables (going to set up proper jsons and includes later)
	file.readWeapFile(weaponList, weap);
	
	//Defines text-channels for certain bot outputs
	//botchannel
	botChan = botGuild.channels.find("name",config.channel[0]);
	//permanant ie bot role messages
	permChan = botGuild.channels.find("name",config.channel[1]);
	//announcements
	anonChan = botGuild.channels.find("name",config.channel[2]);
	//notification channel
	noteChan = botGuild.channels.find("name",config.channel[3]);
	
	
	//automated alert that checks warfarme api in miliseconds 1000 = 1 second
	setInterval(warGet, 60000);
	//set up for the auto role selection
	roleMess = roleSet(roleMess);
	
});

//when a message is sent in any channel it is apart of this line will execute
bot.on('message', (message) =>{
	
	//ignores other bots messages
	if(message.author.bot){
		return;
	}

	//separate the initial term
	let litteral = message.content;
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
	let args = litteral.split(" ");
	litteral = args[0];
	args.shift();

	//Switch statement fo handling all cases based off the first term
	switch(litteral){
		case "temp":
			message.channel.send("This command does not exist");
			break;
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
					case "roleFix":
					message.channel.send("This command will fix the roles for all reaction that want to gain or lose a specific role");					
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
		case "roleFix"://command to triger the automatic setting of roles using reactions and the roleSet function.
			//Call Upon the role Message when found
			roleMess.then(l=>{
				//Generate the List of emoji's as an array
				let emojArr = l.reactions.array();
				//for each emoji
				for(let i = 0; i < emojArr.length; i++){
					let pepes = emojArr[i].users.array();
					//for each user
					for(let j = 0; j < pepes.length; j++){
						//Accept only non-bot users
						if (!pepes[j].bot){
						//Identify the user as a guild member object
							let mem = botGuild.fetchMember(pepes[j]).then(memb=>{
								return memb;
							});
							//based of each emoji for the reaction

							switch(emojArr[i].emoji){
								case getEmoji(config.emoji[0]) :
									roleUpdate(mem,0);
									break;
								case getEmoji(config.emoji[1]) :
									roleUpdate(mem,1);
									break;
								case getEmoji(config.emoji[2]) :
									roleUpdate(mem,2);
									break;
								case getEmoji(config.emoji[3]) :
									roleUpdate(mem,3);
									break;
								case getEmoji(config.emoji[4]) :
									roleUpdate(mem,4);
									break;
								case getEmoji(config.emoji[5]) :
									roleUpdate(mem,5);
									break;
								case getEmoji(config.emoji[6]) :
									roleUpdate(mem,6);
									break;
								default:
									//If not a valid emoji DM the user that it is a invalid emoji
									let emo = emojArr[i].emoji.name;
									pepes[j].createDM().then(l=>{
										l.send(emo + " is not a suggested reaction and has no link please avoid this in the future");
									});
									break;
							}
						}
					}
				}
			});
			//delete the users command
			message.delete();
			//clear and re-assign the reaction's to the role message
			roleMess = roleMess.then(l=>{
				return l.clearReactions();
			});
			roleMess.then(l=>{
				roleSet(l.id);
			});
			break;
		case "roll"://rolls a die default 6 or based off input
			//if it is acompanied by a number roll for that number
			if(typeof args[0] == "number")
				message.reply("You rolled a " + (Math.floor(Math.random() * args[0]) + 1));
			else
				message.reply("You rolled a " + (Math.floor(Math.random() * 6) + 1));
			break;
		case "add"://allows adding a weapon build to the list of weapons requires admin status
			//check for the admin role as defined by the auth.json
			if(!role){
				message.reply("You do not have the proper role for this command");
				break;
			}
			//check for the minimum number of arguments
			if(args.length < 7){
			message.reply("You need to include the weapon name, link to the build, Sustained and Burst DPS numbers, the weapons MR, and the Status chance and a description");
				break;
			}
			//generate the different parts of the weapon struct
			
			//description of the build detail
			let descrip = "";
			for(let r = 6; r < args.length; r++){
				descrip = descrip + args[r] + " ";
			}
			//define everything to the weapon
			let Weapon = {
				Link: args[1],
				Sustained: args[2],
				Burst: args[3],
				MR: args[4],
				Status: args[5],
				Descrip: descrip
			};
			//check if the weapon already exists in the system and adds it to the weapon
			//if not will add the weapon to the map and add it to the list
			if(weaponList[args[0]]){
				weaponList[args[0]].push(Weapon);
			} else {
				weaponList[args[0]] = [];
				weaponList[args[0]].push(Weapon);
			}
			//confirm that it is added and will save the new weapon set to the list
			message.channel.send(args[0] + " added to the list");
			file.weaponOutput(weaponList);
			break;
		case "list"://list the weapons currently with a build in the system
			//pull the names of all the weapons into list
			let list = Object.keys(weaponList);
			//check if there are any weapons in the list
			if(list.length >= 1){
				//create the output string
				let out = "";
				//loop through the list
				for(let name of list){
					//append the weapon to the list
					out += name + ", ";
					//check for the char limit of discord with extra space
					if(out.length >= 1500){
						//output the list and re-assign the output string as new
						message.channel.send(out);
						out = "";
					}
				}
				//out put the last string in the list
				message.channel.send(out);
			} else {
				message.reply("No stored Weapons");
			}
			break;
		case "edit"://allows editing of the desctiption of a weapon build requires admin status
			//check if the user is at an admin level
			if(!role){
				message.reply("You do not have the proper role for this command");
				break;
			}
			//check if all the args are present
			if(!args[2])
			{
				message.channel.send("You are missing parameters, please see !help for information")
				break;
			}
			//check if the weapin exists in the list
			if(!weaponList[args[0]] || args[0] == "request"){
				message.reply(args[0] + " does not exist in the database");
				break;
			}
			//check if the build selected is a valid build
			if(!weaponList[args[0]][(args[1]-1)]){
				message.reply("The selected weapon does not have " + args[1] + " different builds please select within the bounds of the number of builds");
				message.reply(args[0] + " has " + weaponList[args[0]].length + " builds");
				break;
			}
			//take in the new description for the weapon
			let description = "";
			for(let i = 2; i < args.length; i++){
				description += args[i] + " ";
			}
			//assigns the description to the weapon build
			weaponList[args[0]][(args[1]-1)].Descrip = description;
			file.weaponOutput(weaponList);
			break;
		case "delete"://allow deletion of a build requires admin status
			//checks for the admin level role
			if(!role){
				message.reply("You do not have the proper role for this command");
				break;
			}
			if (args[0] == "request")
			{
				message.channel.send("Request is not a valid weapon to remove");
				break;
			}
			//checks if you input a number for the build
			if (args[1] == undefined){
				//check if the weapon exists
				if (weaponList[args[0]]){
					//delete the weapon and all the builds from the list
					message.channel.send(args[0] + " deleted");
					delete weaponList[args[0]];
					weaponList.delete(args[0]);
				}
			//check if the build is within the bounds
			} else if (weaponList[args[0]] && weaponList[args[0]].length >= args[1]){
				//checks if it is the last build for the weapon
				if (weaponList[args[0]].length >= 1){
					//removes the build from the weapon in the list
					weaponList[args[0]].splice((args[1] - 1), 1);
				} else {
					//deletes the weapon since there are no more builds left
					delete weaponList[args[0]];
					weaponList.delete(args[0]);
				}
			//default incase the weapon or build number does not exist
			} else {
				message.reply("Either the weapon does not exist or does not have " + args[1] + " builds");
			}
			//updates the load file
			file.weaponOutput(weaponList);
			break;
		case "get"://allows retrival of multiple builds from the system
			//checks if there is a weapon in the input
			if (args[0] && args[0] != "request"){
				//loop through all the weapons listed
				for (let j = 0; j < args.length; j++){
					//checks if the weapon exists in the system
					if (weaponList[args[j]]){
						//checks incase the weapoin has no builds
						if (weaponList[args[j]][0]){
							//print out the base info
							message.channel.send(args[j] + ": Required MR: " + weaponList[args[j]][0].MR);
							//loops through all the build info
							for(let i = 0; i < weaponList[args[j]].length; i++){
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
			//confirms when all builds are retrieved
			message.channel.send("Done");
			break;
		case "request"://adds to a list of requested weapons builds by your community
			//checks if there is a weapon requested
			if(args[0] == undefined){
				message.reply("You need to add a weapon to request");
				break;
			}
			//adds all the weapons to the requested list
			for(let i = 0; i < args.length; i++){
				if(weaponList["request"].indexOf(args[i]) == -1){
					weaponList["request"].push(args[i]);
					message.channel.send(args[i] + " added to the request list");
				} else {
					message.channel.send(args[i] + " already exists");
				}
			}
			//updates the file
			file.weaponOutput(weaponList);
			break;
		case "get_request"://returns the list of requested builds
			//checks if there are any weapons requested
			if(weaponList["request"].length == 0){
				message.channel.send("No requested builds");
				break;
			}
			// creates the output string and lists all of the weapons in the requested que
			let out = "";
			for(let name of weaponList["request"]){
				out += name + ", ";
				console.log(out.length);
				//confirms the char limit of discord with a buffer area
				if(out.length >= 1500){
					message.channel.send(out);
					out = "";
				}
			}
			//outputs the final message of requested weapons
			if(out !== ""){
				message.channel.send(out);
			}
			break;
		case "clear_request"://allows removal of the request list or to clear the whole list requires admin status
			//checks for admin role
			if(!role){
				message.reply("You do not have the proper role for this command");
				break;
			}
			//checks if there are any specific weapons to remove
			if(!args[0]){
				//clears the whole requested list of any weapons
				weaponList["request"] = [];
				message.reply("Requests have been cleared");
			}
			//removes only the selected weapons from the request list
			else{ 
				for(let i of args){
					let loc = neededWeapons.indexOf(i)
					if(loc > -1){
						message.channel.send(i + " removed");
						neededWeapons.splice(loc,1);
					}
				}
			}
			file.weaponOutput(weaponList);
			break;
		case "setPlaying"://lets bot administraitors set the playing message of the bot
			if (role){
				config.playingMessage = args.join(' ');;
				file.configUpdate(config);
				bot.user.setActivity(config.playingMessage);
				message.reply("Playing message set to: " + config.playingMessage);
			}else{
				message.reply("You do not have the proper role for this command");
			}
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
	//fetch the data from the pc warframe status
	fetch("https://ws.warframestat.us/pc").catch(e=> {
		console.log(e + " Failed to Fetch");})
		//parses the api into json form for easy access
		.then((wfWorldData) => wfWorldData.json()).catch((e)=>{
			console.log(e + " Failed Parsing");})
			//pass in the json object for notification
			.then(data=>{
				WGCetus(data);
				WGAlert(data);
				WGFissure(data);
				WGBaro(data);
				WGNews(data);
			})
			.catch(e=> console.log(e + " Failed to run warGet functions"))
			//update the json for the cached id's to streamline relauching the bot to reduce notifications
				.then(check => {file.writeWGet(wGetLog); file.statOutput(stat);})
				.catch(e=> console.log(e + " Failed to update log"));	
}
//functions to check to reweite for simplification
//news 

//This handles the request for cetus time changes
function WGCetus(data){
	//checks if the cycle has swaped
	if(cetus[0] != data.cetusCycle.isDay){
		//change the day night value
		cetus[0] = data.cetusCycle.isDay;
		if(cetus[0] == true){
			noteChan.send("Cetus has returned to day and the Eidolons have gone back into hiding");
		}else{
			noteChan.send("Night has befallen Cetus and the Eidolons have been agitated and must be stoped");	
		}
	}
	//update the quick output for bot switch statement
	cetus[1] = data.cetusCycle.shortString;
}

//This handles the creation and posting of embeds for new alerts
function WGAlert(data){
	//define the alert id list and the check value for a new notification
	let alert = [];
	let alertBool = false;
	//initiate and set up the discord embed output
	let embed = new Discord.RichEmbed();
	embed.setTitle("New alerts have been activated")
	embed.setColor(0xff0000);
	//go through the list of alerts
	for(let i = 0; i < data.alerts.length; i++){
		let alertNode = data.alerts[i];
		//identifies there is a new allert and adds it to the embed	
		if(wGetLog.alert.indexOf(alertNode.id) == -1){
			alertBool = true;
			alert.push(alertNode.id);
			embed.addField(alertNode.mission.node,
				"Mission Type: " + alertNode.mission.type + 
				"\nEnemy Faction: " + alertNode.mission.faction + 
				"\nAlert Reward: " + alertNode.mission.reward.asString + 
				"\nRemaining Time: " + alertNode.eta + 
				"\nEnemy Level Range: " + alertNode.mission.minEnemyLevel + 
				"-" + alertNode.mission.maxEnemyLevel +
				"\nNightmare Mission: " + alertNode.mission.nightmare +
				"\nArchwing: " + alertNode.mission.archwingRequired
			);
			stat.alert.push(alertNode);
		}else{
			alert.push(alertNode.id);
		}
	//check if a new embed is going to be pushed and push it
	}if(alertBool == true){
		noteChan.send(getRole(config.botRoleMess[2]) + "");
		noteChan.send(embed);
	}
	//update the alert list since there is a new alert
	wGetLog.alert = alert.slice();
}

//This handles the creation of embeds for new fissures
function WGFissure(data){
	//define the alert id list and the check value for a new notification
	let fissure = [];
	let fissureNot = [getRole(config.botRoleFissure[0])];
	//console.log(fissureNot);
	let fisBool = false;
	//initiate and set up the discord embed output
	const embed = new Discord.RichEmbed();
	embed.setTitle("New Fissures have Opened");
	embed.setColor(0xffff00);
	//loop through the fissure list
	for(let i = 0; i < data.fissures.length; i++){
		let fissureNode = data.fissures[i];
		//check if there is a new fissure
		if(wGetLog.fissure.indexOf(fissureNode.id) == -1){
			fisBool = true;
			fissure.push(fissureNode.id);
			embed.addField( fissureNode.node,
				"Mission Type: " + fissureNode.missionType + 
				"\nEnemy Faction: " + fissureNode.enemy + 
				"\nFissure Teir: " + fissureNode.tier + 
				"\nTime Until Collapse: " + fissureNode.eta
			);
			fissRole(fissureNot, fissureNode);
			stat.fiss.push(fissureNode);
		}else{
			fissure.push(fissureNode.id);
		}
	}
	//check if there is a new fissure and push the embed
	if(fisBool == true){
		let string = "";
		//console.log(fissureNot);
		fissureNot.forEach(x=> string = string + x + " ");
		//console.log(string);
		noteChan.send(string);
		noteChan.send(embed);
	}
	//update the fissure list with the new list
	wGetLog.fissure = fissure.slice();
}

//This Handles notification and listing of Baro Ki'teer and his inventory
function WGBaro(data){
	//check if baro was here last tick
	if(baro == false){
		//if he wasn't check if he is now here
		if(data.voidTrader.active == true){
			baro = true;
			//set up the baro embed
			let workEmbed = new Discord.RichEmbed();
			workEmbed.setTitle("Baro Ki'teer's inventory");
			workEmbed.setColor(0x63738c);
			let baroInv = data.voidTrader.inventory;
			let embed = [];
			//loop through baros inventory
			for(let i = 0; i < baroInv.length; i++){
				if(i%20 == 0 && i != 0){
					embed.push(workEmbed);
					workEmbed = new Discord.RichEmbed();
					workEmbed.setTitle("Baro Ki'teer's inventory");
					workEmbed.setColor(0x63738c);
				}
				workEmbed.addField(baroInv[i].item, "Ducuts: " + baroInv[i].ducats + 
					" Credits: " + baroInv[i].credits);
			}
			embed.push(workEmbed);
			anonChan.send("@everyone Heyoo Brother Tenno, \nBaro Ki'tter is Here.");
			embed.forEach((j)=>{anonChan.send(j)});
			//console.log(baroInv);
		
		}
	}else{
		if(data.voidTrader.active == false){
			baro = false;
		}
	}
}

//Handles Notificatons for News hot off the press from Warframe
function WGNews(data){
	let news = [];
	for(let i = 0; i < data.news.length; i++){
		let newsNode = data.news[i];
		if(wGetLog.news.indexOf(newsNode.id) == -1){
			news.push(newsNode.id);
			if(newsNode.update == true || newsNode.primeAccess == true){
				anonChan.send("@everyone " + newsNode.message +
					"\nFourm Link: " + newsNode.link);
			}else{
				if(newsNode.translations.en != null){

					noteChan.send(getRole(config.botRoleMess[1]) + " " + newsNode.message +
						"\nFourm Link: " + newsNode.link);
				}
			}
			stat.news.push(newsNode);
		}else{
			news.push(newsNode.id);
		}
	}
	wGetLog.news = news.slice();	
}

//Obtain the role object from a guild based of the exact name of the role
function getRole(string){
	return (botGuild.roles.find('name', string));
}


function getEmoji(string){
	return botGuild.emojis.get(string);
}

//Create or find the role setting message and will add the specified reactions to the message
//take in the message ID and return the message object, This simplifies storing and finding
function roleSet(message){
	if(message == null){
		permChan.send("this is a new message");
		console.log("Role Set message created");
		message = permChan.fetchMessages({limit: 1})
			.then(function(value){
				return value.first()
			});
		message.then(l=> {
			l.edit("React with " 
				+ getEmoji(config.emoji[0]) + " to gain or lose the Fissure role\nReact with " 
				+ getEmoji(config.emoji[1]) + ' to gain or lose the Lith role\nReact with '
				+ getEmoji(config.emoji[2]) + " to gain or lose the Meso role\nReact with "
				+ getEmoji(config.emoji[3]) + " to gain or lose the Neo role\nReact with "
				+ getEmoji(config.emoji[4]) + " to gain or lose the Axi role\nReact with "
				+ getEmoji(config.emoji[5]) + " to gain or lose the Endurance role\nReact with "
				+ getEmoji(config.emoji[6]) + " to gain or lose the Quick role\n"
				+ 'When you are ready send !roleFix in ' + config.channel[0]);
		});
	}else{
		message = permChan.fetchMessage(message)
			.then(value => {
				return value;
			}).catch(e => {
				//console.log(e);
				return roleSet(null);
			});
	}
	message.then(async(message) =>{
		await message.react(getEmoji(config.emoji[0]));
		await message.react(getEmoji(config.emoji[1]));
		await message.react(getEmoji(config.emoji[2]));
		await message.react(getEmoji(config.emoji[3]));
		await message.react(getEmoji(config.emoji[4]));
		await message.react(getEmoji(config.emoji[5]));
		await message.react(getEmoji(config.emoji[6]));
		//console.log(message);
		config.roleMessage = message.id;
		file.configUpdate(config);
	});
	return message;
}

function fissRole(fissureNot, fissureNode){
	getFissRole(fissureNode).forEach((x)=>{
		if(!fissureNot.some((y)=> getRole(config.botRoleFissure[x]).name == y.name)){
			fissureNot.push(getRole(config.botRoleFissure[x]));
		}
	});
}

function getFissRole(fissNode){
	//parse fiss node for our fissure list
	let output = [0];

	//fissure tier
	switch(fissNode.tier){
		//lith
		case "Lith":
			output.push(1);
			break;
		//meso
		case "Meso":
			output.push(2);
			break;
		//neo
		case "Neo":
			output.push(3);
			break;
		//axi
		case "Axi":
			output.push(4);
			break;
		default:
			adm.createDM().then(x=> x.send(fissNode.tier + " Does not have a Teir"));
			break;
	}
	//endurance speed
	switch(fissNode.missionType){
		case "Defense":
		case "Survival":
		case "Excavation":
		case "Interception":
			output.push(5);
			break;
		case "Spy":
		case "Exterminate":
		case "Extermination":
		case "Capture":
		case "Rescue":
		case "Hive":
			output.push(6);
			break;
		case "Mobile Defense":
		case "Sabotage":
			break;
		default:
			adm.createDM().then(x=> x.send(fissNode.missionType + " does not have a applicable mission tag"));
			break;
	}

	//warlord Pick
	/*
	Scrapped for confussing message output
	switch(fissNode.node){
		case "Mot (Void)":
			output.push(7);
			break;
		default:
			//then the node is not deamed by the warlords
			break;
	}
	*/
	
	return output;
}

function roleUpdate(mem,num){
	//Once the guild member is recieved
	mem.then(l=> {
		//Identify if they have the role for said member
		if(l.roles.array().includes(getRole(config.botRoleFissure[num]))){
			//remove the role if they have it
			mem.then(memb => {memb.removeRole(getRole(config.botRoleFissure[num]))});
		}else{
			//add's the role if they don't have it
			mem.then(memb => {memb.addRole(getRole(config.botRoleFissure[num]))});
		}
	})
}