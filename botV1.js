//Discord lib
const Discord = require('discord.js');

//Config for specific constants that are user based
let config = require("./auth.json");
let wGetLog = require("./WGet.json");

//Filesystem to store relevant data to the proper files
const fs = require("./filewrite.js");
const file = new fs();

//Instantiates the bot
const bot = new Discord.Client();

//bot Channels
let botChan, anonChan, noteChan, permChan;


//admin role so bot can dm when there is an issue or missing exception
let adm;


/*
//Fissure alert Statistic collection
let stat = require("./stat.json");
//define stat if empty
if(stat.alert == null){
	stat = {
		alert:[],
		fiss:[],
		news:[],
		sortie: "",
		baro: false,
		cetus: false
	};
}
*/

//Defines the message for the role selection
let roleMess = config.roleMessage;

//parse the Warframe Data
const fetch = require('node-fetch')

//current universal role declaration to define the user as admin
let role = false;

//predefined variables for identifying the current guild
let botGuild;
//define the emoji slaver guild
let emojiGuild;

//What the bot does on startup
bot.on("ready", () => {

	//sets up the main guild for the bot
	botGuild = bot.guilds.find('name', config.mainGuild);
	
	//set the emoji guild for remote emojis
	emojiGuild = bot.guilds.find('name', config.emojiGuild);


	//declares a main testing role ie dm target
	botGuild.members.array().forEach(x=>{
		if(x.user.id == config.botAdmin){
			adm = x.user;
		}
	});
	//test dm to the admin to test other random things
	//adm.createDM().then(x=> x.send(getEmoji(emojiGuild,config.emoji[8]) + ""));

	//Seting the playing text for the bot
	bot.user.setActivity(config.playingMessage);
	
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
	console.log("Setup Complete");
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
								case getEmoji(emojiGuild,config.otherEmoji[0]) :
									roleUpdate(mem,1);
									break;
								case getEmoji(emojiGuild,config.otherEmoji[1]) :
									roleUpdate(mem,2);
									break;
								case getEmoji(emojiGuild,config.otherEmoji[2]) :
									roleUpdate(mem,3);
									break;
								case getEmoji(emojiGuild,config.otherEmoji[3]) :
									roleUpdate(mem,4);
									break;
								case getEmoji(emojiGuild,config.otherEmoji[4]) :
									roleUpdate(mem,5);
									break;
								case getEmoji(emojiGuild,config.otherEmoji[5]) :
									roleUpdate(mem,6);
									break;
								case getEmoji(emojiGuild,config.otherEmoji[6]) :
									roleUpdate(mem,7);
									break;
								case getEmoji(emojiGuild,config.otherEmoji[10]) :
									roleUpdate(mem,8);
									break;
								case getEmoji(emojiGuild,config.otherEmoji[7]) :
									roleUpdate(mem,9);
									break;
								case getEmoji(emojiGuild,config.otherEmoji[8]) :
									roleUpdate(mem,10);
									break;
								case getEmoji(emojiGuild,config.otherEmoji[9]) :
									roleUpdate(mem,11);
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
			let num = parseInt(args[0]);
			if(typeof num == "number")
				message.reply("You rolled a " + (Math.floor(Math.random() * num) + 1));
			else
				message.reply("You rolled a " + (Math.floor(Math.random() * 6) + 1));
			break;
		case "setPlaying"://lets bot administraitors set the playing message of the bot
			if (role){
				config.playingMessage = args.join(' ');;
				file.output(config,config.fileWrite[0]);
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

//Obtain the role object from a guild based of the exact name of the role
function getRole(string){
	return (botGuild.roles.find('name', string));
}

//Take the guild and then the emoji value and will return the emoji to put in a message
function getEmoji(guild ,string){
	return guild.emojis.get(string);
}








//Function to load in the data from the Warframe API
async function warGet(){
	//console.log("WarGet");
	//fetch the data from the pc warframe status
	fetch("https://ws.warframestat.us/pc").catch(e=> {
		console.log(e + " Failed to Fetch");})
		//parses the api into json form for easy access
		.then((wfWorldData) => wfWorldData.json()).catch((e)=>{
			tempFetch()})
			//pass in the json object for notification
			.then(data=>{
				WGCetus(data);
				WGAlert(data);
				WGFissure(data);
				WGSortie(data);
				WGNightWave(data);

				WGBaro(data);
				WGNews(data);
				
			})
			.catch(e=> console.log(e + " Failed to run warGet functions"))
			//update the json for the cached id's to streamline relauching the bot to reduce notifications
				.then(check => {file.output(wGetLog,config.fileWrite[1]);})
				.catch(e=> console.log(e + " Failed to update log"));	
}
//functions to check to reweite for simplification
//news 
function tempFetch(){
	//fetch the data from the pc warframe status
	fetch("https://ws.warframestat.us/pc").catch(e=> {
		console.log(e + " Failed to Fetch");})
		//parses the api into json form for easy access
		.then((wfWorldData) => wfWorldData.json()).catch((e)=>{
			console.log(e + " Failed Parsing");})
}
//This handles the request for cetus time changes
function WGCetus(data){
	//checks if the cycle has swaped
	if(wGetLog.cetus != data.cetusCycle.isDay){
		//change the day night value
		wGetLog.cetus = data.cetusCycle.isDay;
		if(wGetLog.cetus == true){
			noteChan.send("Cetus has returned to day and the Eidolons have gone back into hiding");
		}else{
			noteChan.send("Night has befallen Cetus and the Eidolons have been agitated and must be stoped");	
		}
	}
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
		}
		alert.push(alertNode.id);
	//check if a new embed is going to be pushed and push it
	}if(alertBool == true){
		noteChan.send(getRole(config.botRoleMess[9]) + "");
		noteChan.send(embed);
	}
	//update the alert list since there is a new alert
	wGetLog.alert = alert.slice();
}

//This handles the creation of embeds for new fissures
function WGFissure(data){
	//define the alert id list and the check value for a new notification
	let fissure = [];
	let fissureNot = [getRole(config.botRoleMess[1])];
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
			fissureNode = fissFix(fissureNode);
			fisBool = true;
			embed.addField( fissureNode.node,
				"Mission Type: " + fissureNode.missionType + 
				"\nEnemy Faction: " + fissureNode.enemy + 
				"\nFissure Teir: " + fissureNode.tier + 
				"\nTime Until Collapse: " + fissureNode.eta
			);
			fissRole(fissureNot, fissureNode);
			
		}
		fissure.push(fissureNode.id);
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

//send a fissure to get the roles it would require and only add new ones to fissureNot
function fissRole(fissureNot, fissureNode){
	getFissRole(fissureNode).forEach((x)=>{
		if(!fissureNot.some((y)=> getRole(config.botRoleMess[x]).name == y.name)){
			fissureNot.push(getRole(config.botRoleMess[x]));
		}
	});
}

//return an array of the roles that pertian to this fissure
function getFissRole(fissNode){
	//parse fiss node for our fissure list
	let output = [];

	//fissure tier
	switch(fissNode.tier){
		//lith
		case "Lith":
			output.push(2);
			break;
		//meso
		case "Meso":
			output.push(3);
			break;
		//neo
		case "Neo":
			output.push(4);
			break;
		//axi
		case "Axi":
			output.push(5);
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
			output.push(6);
			break;
		case "Spy":
		case "Exterminate":
		case "Extermination":
		case "Capture":
		case "Rescue":
		case "Hive":
			output.push(7);
			break;
		case "Mobile Defense":
		case "Sabotage":
			break;
		default:
			adm.createDM().then(x=> x.send(fissNode.missionType + " does not have a applicable mission tag"));
			break;
	}
	return output;
}

//Trim and fix the fissure node for consistency
function fissFix(data){
	if(data.missionType == "Exterminate" || data.missionType == "Extermination"){
		data.missionType = "Extermination";
	}
	let fiss = {
		id: data.id,
		node: data.node,
		missionType: data.missionType,
		enemy: data.enemy,
		tier: data.tier,
		eta: data.eta
	}
	return fiss;
}

//This Handles notification and listing of Baro Ki'teer and his inventory
function WGBaro(data){
	//check if baro was here last tick
	if(wGetLog.baro == false){
		//if he wasn't check if he is now here
		if(data.voidTrader.active == true){
			wGetLog.baro = true;
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
			wGetLog.baro = false;
		}
	}
}

//Handles Notificatons for News hot off the press from Warframe
function WGNews(data){
	let news = [];
	for(let i = 0; i < data.news.length; i++){
		let newsNode = data.news[i];
		let id = newsNode.id;
		newsNode = newsFix(newsNode);
		if (newsNode.en){
			if(wGetLog.news.indexOf(id) == -1){
				if(newsNode.update == true || newsNode.primeAccess == true){
					anonChan.send("@everyone " + newsNode.message +
						"\nFourm Link: " + newsNode.link);
				}else{
					noteChan.send(getRole(config.botRoleMess[8]) + " " + newsNode.message +
						"\nFourm Link: " + newsNode.link);
				}			
			}
		}
		news.push(id);
	}
	wGetLog.news = news.slice();	
}

//Trim and fix the news node before using it
function newsFix(data){
	let news = null
	let en = false;
	if (typeof data.translations.en !== 'undefined'){
		en = true;
		data.message = data.translations.en;
	}
	news = {
		message: data.message,
		link: data.link,
		month: data.date.substring(5,7),
		year: data.date.substring(0,4),
		update: data.update,
		primeAccess: data.primeAccess,
		stream: data.stream,
		en: en
	}
	return news;
}

function WGNightWave(data){
	if(data.nightwave != undefined){
		let nightID = [];
		let night = data.nightwave.activeChallenges;
		let nightBool = false;

		const embed = new Discord.RichEmbed();
		embed.setTitle("Nora Night Daily Transmision");
		embed.setColor(0x000000);

		for(let i = 0; i<night.length; i++){
			let nightNode = night[i];
			if(wGetLog.nightwave.indexOf(nightNode.id) == -1){
				nightBool = true;
				embed.addField( nightNode.title,
					"Challenge: " + nightNode.desc + 
					"\nReputation: " + nightNode.reputation
				);
			}
			nightID.push(nightNode.id);
		}if(nightBool == true){
			noteChan.send(getRole(config.botRoleMess[11]) + "");
			noteChan.send(embed);
			wGetLog.nightwave = nightID;
		}
	}
}

function WGSortie(data){
	let sortie = data.sortie;
	if(wGetLog.sortie != sortie.id){
		let embed = new Discord.RichEmbed();
		embed.setTitle("Sortie Update -- " + sortie.faction);
		embed.setColor(0x4f034d);
		for(let i = 0; i < sortie.variants.length; i++){
			embed.addField(sortie.variants[i].missionType,
				"Location: " + sortie.variants[i].node +
				"\nModifier: " + sortie.variants[i].modifier +
				"\nDescription: " + sortie.variants[i].modifierDescription);
		}
		noteChan.send(getRole(config.botRoleMess[10]) + "");
		noteChan.send(embed);
		wGetLog.sortie = sortie.id;
	}
}

//Create or find the role setting message and will add the specified reactions to the message
//take in the message ID and return the message object, This simplifies storing and finding
function roleSet(message){
	if(message == null){

		let embed = new Discord.RichEmbed();
		embed.setTitle("Select your Roles then send !roleFix in #" + config.channel[0] );
		embed.setColor(0xffffff);

		embed.addField("Fissure",
			"React with " + getEmoji(emojiGuild,config.otherEmoji[0]) + " to gain or lose the Fissure role\n" 
			+ "React with " + getEmoji(emojiGuild,config.otherEmoji[1]) + " to gain or lose the Lith role\n" 
			+ "React with "	+ getEmoji(emojiGuild,config.otherEmoji[2]) + " to gain or lose the Meso role\n" 
			+ "React with "	+ getEmoji(emojiGuild,config.otherEmoji[3]) + " to gain or lose the Neo role\n" 
			+ "React with "	+ getEmoji(emojiGuild,config.otherEmoji[4]) + " to gain or lose the Axi role\n"
			+ "React with " + getEmoji(emojiGuild,config.otherEmoji[5]) + " to gain or lose the Endurance role\n"
			+ "React with " + getEmoji(emojiGuild,config.otherEmoji[6]) + " to gain or lose the Quick role\n"


			);
		embed.addField("Other",
			 "React with " + getEmoji(emojiGuild,config.otherEmoji[7]) + " to gain or lose the Alert role\n"
			 + "React with " + getEmoji(emojiGuild,config.otherEmoji[8]) + " to gain or lose the Sortie role\n"
			 + "React with " + getEmoji(emojiGuild,config.otherEmoji[9]) + " to gain or lose the NightWave role\n"
			 + "React with " + getEmoji(emojiGuild,config.otherEmoji[10]) + " to gain or lose the News role\n"

			);

		permChan.send(embed);
		
		message = permChan.fetchMessages({limit: 1})
			.then(function(value){
				console.log("Role Set message created");
				return value.first()
			});
	}else{
		message = permChan.fetchMessage(message)
			.then(value => {
				return value;
			}).catch(e => {
				return roleSet(null);
			});
	}
	message.then(async(message) =>{
		await message.react(getEmoji(emojiGuild,config.otherEmoji[0]));
		await message.react(getEmoji(emojiGuild,config.otherEmoji[1]));
		await message.react(getEmoji(emojiGuild,config.otherEmoji[2]));
		await message.react(getEmoji(emojiGuild,config.otherEmoji[3]));
		await message.react(getEmoji(emojiGuild,config.otherEmoji[4]));
		await message.react(getEmoji(emojiGuild,config.otherEmoji[5]));
		await message.react(getEmoji(emojiGuild,config.otherEmoji[6]));
		await message.react(getEmoji(emojiGuild,config.otherEmoji[7]));
		await message.react(getEmoji(emojiGuild,config.otherEmoji[8]));
		await message.react(getEmoji(emojiGuild,config.otherEmoji[9]));
		await message.react(getEmoji(emojiGuild,config.otherEmoji[10]));
		//console.log(message);
		config.roleMessage = message.id;
		file.output(config,config.fileWrite[0]);
	});
	return message;
}

function roleUpdate(mem,num){
	//Once the guild member is recieved
	mem.then(l=> {
		//Identify if they have the role for said member
		if(l.roles.array().includes(getRole(config.botRoleMess[num]))){
			//remove the role if they have it
			mem.then(memb => {memb.removeRole(getRole(config.botRoleMess[num]))});
		}else{
			//add's the role if they don't have it
			mem.then(memb => {memb.addRole(getRole(config.botRoleMess[num]))});
		}
	})
}