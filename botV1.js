//Discord lib
const Discord = require('discord.js');

//Config for specific constants that are user based
let config = require("./auth.json");

//Filesystem to store relevant data to the proper files
const fs = require("./filewrite.js");
const file = new fs();


//Preexisting values from the wget function that are currently active
let wGetLog = require("./WGet.json");

//pull data from http requests
const fetch = require('node-fetch');

//starting temporary rss feed reader
const xkcd = require("./XKCD.js");

let load = "";
//Instantiates the bot
const bot = new Discord.Client();

//Should reconect the bot if it momentarily disconnects from the server 
bot.on("error", (e) => console.error(e));
bot.on("warn", (e) => console.warn(e));
//bot.on("debug", (e) => console.info(e));

//Command will log the bot in upon start up
bot.login(config.token);

//bot Channels
let botChan, anonChan, noteChan, permChan;

//admin role so bot can dm when there is an issue or missing exception
let admin;

//get the current day for calculating the daily reset
let date = new Date().getUTCDate();

//Defines the message for the role selection
let roleMess = config.roleMessage;

//predefined variables for identifying the current guild
let botGuild;
//define the emoji slaver guild
let emojiGuild;

//What the bot does on startup
bot.on("ready", () => {
	console.log("Setup Beginning")
	//sets up the main guild for the bot



	botGuild = bot.guilds.cache.find(guild => guild.name === config.mainGuild);
	console.log(botGuild.name);
	
	//set the emoji guild for remote emojis
	emojiGuild = bot.guilds.cache.find(guild => guild.name === config.emojiGuild);
	console.log(emojiGuild.name);

	//declares a main testing role ie dm target
	botGuild.members.cache.array().forEach(x=>{
		if(x.user.id == config.botAdmin){
			admin = x.user;
		}
	});

	//test dm to the admin to test other random things
//	adm.createDM().then(x=> x.send(getEmoji(emojiGuild,config.emoji[8]) + ""));

	//Seting the playing text for the bot
//	bot.user.setActivity(config.playingMessage);
	
	//Defines text-channels for certain bot outputs
	//botchannel
	botChan = botGuild.channels.cache.find(channel => channel.name === config.channel[0]);
	//permanant ie bot role messages
	permChan = botGuild.channels.cache.find(channel => channel.name === config.channel[1]);
	//announcements
	anonChan = botGuild.channels.cache.find(channel => channel.name === config.channel[2]);
	//notification channel
	noteChan = botGuild.channels.cache.find(channel => channel.name === config.channel[3]);
	
	//Call all the reccuring functions that are on a Timer
	loop();
	//warGet();
	
	//set up for the auto role selection
//	roleMess = roleSet(roleMess);
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
	let adminStat;
	if(message.member.roles.cache.some(r=>config.botRoleAdmin.includes(r.name)))	{
		adminStat = true;
	}else{
		adminStat = false;
	}

	//separates the arguments
	litteral = litteral.slice(1);
	let args = litteral.split(" ");
	litteral = args[0];
	args.shift();

	//Switch statement fo handling all cases based off the first term
	switch(litteral){
		case "temp":
			message.channel.send(`${getRole("Alert")}`);
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
			message.reply("your role value is " + adminStat);
			break;
		case "roleFix"://command to triger the automatic setting of roles using reactions and the roleSet function.
			break;
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
							let role = null;
							switch(emojArr[i].emoji){
								case getEmoji(emojiGuild,config.otherEmoji[0]) :
									role = "Fissure";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[1]) :
									role = "Lith";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[2]) :
									role = "Meso";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[3]) :
									role = "Neo";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[4]) :
									role = "Axi";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[5]) :
									role = "Endurance";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[6]) :
									role = "Quick";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[10]) :
									role = "News";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[7]) :
									role = "Alert";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[8]) :
									role = "Sortie";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[9]) :
									role = "NightWave";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[11]) :
									role = "Baro";
									break;
								case getEmoji(emojiGuild,config.otherEmoji[12]) :
									role = "Update";
									break;
								default:
							}
							if(role !== null){
								roleUpdate(mem,role);	
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
			if (adminStat){
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


function loop(){

	//looping loading status
	setInterval(loading, 5000);

	//automated alert that checks warfarme api in miliseconds 1000 = 1 second
	setInterval(warGet, 60000);

	//grab the rss feed

//	rss();
//	setInterval(rss, 3600000)


}

function rss(){

	const comic = new xkcd();
	
	const curr = require("./xkcd.json");
	let temp = [];
	comic.getKCD().then((xk)=>{
		//console.log(xk);
		xk.forEach((x)=>{
			if(curr.xkcd.indexOf(x.id) === -1){
				let embed = new Discord.MessageEmbed();
				embed.setTitle(x.title)
				embed.setColor(0xff0000)
				embed.setImage(x.img)
				embed.addField("Hover text\n" + x.hover)		
				admin.createDM().then((dm) => dm.send(embed));
			}
			temp.push(x.id);
		})
		file.output(temp, "xkcd.json");
		

	});
	
}

//Obtain the role object from a guild based of the exact name of the role
function getRole(string){
	return (botGuild.roles.cache.find(role => role.name === string));
}

//Take the guild and then the emoji value and will return the emoji to put in a message
function getEmoji(guild ,string){
	return guild.emojis.get(string);
}

//Function to load in the data from the Warframe API

async function warGet(){
	fetch("https://api.warframestat.us/pc/")
		.catch(e => console.log(e))
		.then((response) => {
			if(response.status !== undefined){
				if(response.status == 200){
					response.text().catch(e => console.log(e))
					.then((payload) => {
						let ws = JSON.parse(payload);
						WGNews(ws.news);
						WGCetus(ws.cetusCycle);
						WGAlert(ws.alerts);
						WGFissure(ws.fissures);
						WGSortie(ws.sortie);
						WGNightWave(ws.nightwave);
						WGBaro(ws.voidTrader);
						WGKuva(ws.kuva, new Date(ws.timestamp));
						WGArbis(ws.arbitration);
						WGReset(new Date(ws.timestamp), date);

						//	WGInvasion(ws.invasions);
						//earth valis, constructionproggress
						//invasion daily deal simmaris
					}).then(() => {file.output(wGetLog,config.fileWrite[1]);})
					.catch((e) => {console.log(e)});
				}
			}else{
				console.log("API miss");
			}
		});			
}


//functions commented
//news
//news fix

//This handles the request for cetus time changes
function WGCetus(data){
	//checks if the cycle has swaped
	if(wGetLog.cetus != data.isDay){
		//change the day night value
		wGetLog.cetus = data.isDay;
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
	let embed = new Discord.MessageEmbed();
	embed.setTitle("New alerts have been activated")
	embed.setColor(0xff0000);
	//go through the list of alerts
	for(let i = 0; i < data.length; i++){
		let alertNode = data[i];
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
		noteChan.send(`${getRole("Alert")}`, {embed});
	}
	//update the alert list since there is a new alert
	wGetLog.alert = alert.slice();
}

//This handles the creation of embeds for new fissures
function WGFissure(data){
	//define the alert id list and the check value for a new notification
	let fissure = [];
	let fissureNot = [getRole("Fissure")];
	let fisBool = false;
	//initiate and set up the discord embed output
	const embed = new Discord.MessageEmbed();
	embed.setTitle("New Fissures have Opened");
	embed.setColor(0xffff00);
	//loop through the fissure list
	for(let i = 0; i < data.length; i++){
		let fissureNode = data[i];
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
		fissureNot.forEach(x=> string = string + `${x} `);
		//console.log(string);
		noteChan.send(string, {embed});
	}
	//update the fissure list with the new list
	wGetLog.fissure = fissure.slice();
}

//send a fissure to get the roles it would require and only add new ones to fissureNot
function fissRole(fissureNot, fissureNode){

	//loop through the list of current roles to output all the role notifications
	getFissRole(fissureNode).forEach((x)=>{
		if(!fissureNot.some((y)=> getRole(x).name == y.name)){
			fissureNot.push(getRole(x));
		}
	});
}

//return an array of the roles that pertian to this fissure
function getFissRole(fissNode){
	//parse fiss node for our fissure list
	let output = [];

	//endurance speed
	switch(fissNode.missionType){
		case "Defense":
		case "Survival":
		case "Excavation":
		case "Disruption":
		case "Interception":
			output.push("Endurance");
			break;
		case "Spy":
		case "Extermination":
		case "Capture":
		case "Rescue":
		case "Hive":
			output.push("Quick");
			break;
		case "Mobile Defense":
		case "Sabotage":
		case "Assault":
			break;
		default:
			admin.createDM().then(x=> x.send(fissNode.missionType + " does not have a applicable mission tag"));
			break;
	}
	return output;
}

//Trim and fix the fissure node for consistency
function fissFix(data){
	//set extermiantion text
	if(data.missionType == "Exterminate" || data.missionType == "Extermination"){
		data.missionType = "Extermination";
	}
	
	//collect the important data
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
		if(data.active == true){
			wGetLog.baro = true;
			//set up the baro embed
			let workEmbed = new Discord.MessageEmbed();
			workEmbed.setTitle("Baro Ki'teer's inventory");
			workEmbed.setColor(0x63738c);
			let baroInv = data.inventory;
			let embed = [];
			//loop through baros inventory
			for(let i = 0; i < baroInv.length; i++){
				if(i%20 == 0 && i != 0){
					embed.push(workEmbed);
					workEmbed = new Discord.MessageEmbed();
					workEmbed.setTitle("Baro Ki'teer's inventory");
					workEmbed.setColor(0x63738c);
				}
				workEmbed.addField(baroInv[i].item, "Ducuts: " + baroInv[i].ducats + 
					" Credits: " + baroInv[i].credits);
			}
			embed.push(workEmbed);
			anonChan.send(`${getRole("Baro")} Heyoo Brother Tenno, \nBaro Ki'tter is Here.`, {embed});
			//console.log(baroInv);
		
		}
	}else{
		if(data.active == false){
			wGetLog.baro = false;
		}
	}
}

//Handles Notificatons for News hot off the press from Warframe
function WGNews(newsFull){
	//Set up array to put currently active news ID's into
	let news = [];
	//loop through the full list of currently active news
	for(let i = 0; i < newsFull.length; i++){
		//select the news and trim the data to needs
		let newsNode = newsFull[i];
		let id = newsNode.id;
		newsNode = newsFix(newsNode);
		//check if the id matches one that has already been listed
		if(wGetLog.news.indexOf(id) === -1){
			//check if the news is an english news segment
			if (newsNode.en){
				//Identify if it is an Update or Prime Access news to link everyone
				if(newsNode.update == true || newsNode.primeAccess == true){
					anonChan.send(`${getRole("Updates")} ${newsNode.message} `
						+ `\nFourm Link: ${newsNode.link}`);
				//otherwise just notify the news channel	
				}else{
					noteChan.send(`${getRole("News")} ${newsNode.message} `
						+ `\nFourm Link: ${newsNode.link}`);
				}
			}
		}
		//add the id to the active list so we don't repost any news Items
		news.push(id);
	}
	//update the list of active news articles to be stored
	wGetLog.news = news.slice();	
}

//Trim and fix the news node before using it
function newsFix(data){
	//create a blank object
	let news = null
	let en = false;
	//check if there is an english translation or no defined language to set the news as english
	if (typeof data.translations.en !== 'undefined'){
		en = true;
		data.message = data.translations.en;
	}
	//Copy over the news article information that we need in the format that we need
	news = {
		message: data.message,
		link: data.link,
		update: data.update,
		primeAccess: data.primeAccess,
		stream: data.stream,
		en: en
	}
	return news;
}

function WGNightWave(data){
	//check if there is a nightwave

	if(data != undefined){
		let nightID = [];
		let night = data.activeChallenges;
		let nightBool = false;

		const embed = new Discord.MessageEmbed();
		embed.setTitle("Nora Night Daily Transmision");
		embed.setColor(0x000000);
		for(let i = 0; i < night.length; i++){
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
			noteChan.send(`${getRole("NightWave")}`, {embed});
			wGetLog.nightwave = nightID;
		}
	}
}

function WGSortie(data){
	let sortie = data;
	if(wGetLog.sortie != sortie.id){
		let embed = new Discord.MessageEmbed();
		embed.setTitle("Sortie Update -- " + sortie.faction);
		embed.setColor(0x4f034d);
		for(let i = 0; i < sortie.variants.length; i++){
			embed.addField(sortie.variants[i].missionType,
				"Location: " + sortie.variants[i].node +
				"\nMission: " + sortie.variants[i].missionType +
				"\nModifier: " + sortie.variants[i].modifier +
				"\nDescription: " + sortie.variants[i].modifierDescription);
		}
		noteChan.send(`${getRole("Sortie")}`, {embed});
		wGetLog.sortie = sortie.id;
	}
}

function WGInvasion(data){
	let invasion = [];
	let invasionBool = false;
	//initiate and set up the discord embed output
	let embed = new Discord.MessageEmbed();
	embed.setTitle("New Invasions have started, gear up Tenno");
	embed.setColor(0xffffff);
	//loop throught all invasions currently active
	for(let i = 0; i < data.length; i++){
		let invasionNode = data[i];
		//check if it is a new invasion
		if(wGetLog.invasion.indexOf(invasionNode.id) == -1){
			invasionBool = true;
			//check if there aretwo sides of the invasion
			if(invasionNode.vsInfestation){
				embed.addField(invasionNode.node,
					"Mission Rewards: " + invasionNode.defenderReward.asString);
	
			}else{
				embed.addField(invasionNode.node,
					"Reward A: " + invasionNode.attackerReward.asString +
					"\nReward B: " + invasionNode.defenderReward.asString);
			}
		}
		invasion.push(invasionNode.id);
	}
	//check if there is an embed to print
	if(invasionBool == true){
		noteChan.send(`${getRole("Invasion")}`, {embed});
	}
	//update the alert list since there is a new alert
	wGetLog.invasion = invasion.slice();
}

function WGKuva(data, timestamp){

}

function WGArbis(data){
	
}

function WGReset(timestamp, currDate){
	//console.log(timestamp);
	//console.log(currDate);
	if(timestamp.getUTCHours() === 0 && timestamp.getUTCDate() != currDate){
		currDate = timestamp.getUTCDate;
		console.log("daily Reset");
		noteChan.send("Daily Reset has occured");
	}
}
//end of warGet


//Create or find the role setting message and will add the specified reactions to the message
//take in the message ID and return the message object, This simplifies storing and finding
function roleSet(message){
	if(message == null){

		let embed = new Discord.MessageEmbed();
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
			 + "React with " + getEmoji(emojiGuild,config.otherEmoji[11]) + " to gain or lose the Baro role\n"
			 + "React with " + getEmoji(emojiGuild,config.otherEmoji[12]) + " to gain or lose the Update role\n"
			);

		permChan.send(embed);
		
		message = permChan.fetchMessages({limit: 1})
			.then(function(value){
				console.log("Role Set message created");
				return value.first()
			});
	}else{
		message = permChan.messages.fetch(message)
			.then(value => {
				return value;
			}).catch(e => {
				return roleSet(null);
			});
	}
	message.then(async(message) =>{

		for(let i = 0; i < 13; i++)
		{
			await message.react(getEmoji(emojiGuild,config.otherEmoji[i]));
		}

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
			mem.then(memb => {memb.roles.remove(getRole(config.botRoleMess[num]))});
		}else{
			//add's the role if they don't have it
			mem.then(memb => {memb.roles.add(getRole(config.botRoleMess[num]))});
		}
	})
}

function loading(){

	bot.user.setActivity("Loading." + load);
	if(load === "....."){
		load = "";
	}else{
		load += ".";
	}
}

